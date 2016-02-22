var runTests = function(resultPort, managedFrame) {
    console.log('** Running tests **');

    var pageUrl = 'http://localhost:8000/tests/page.html';
    var ajaxUrl = 'http://localhost:8000/tests/content-script-ajax.html';

    var observer = null;

    console.log('\nTesting tabIds and frameIds in frame: ' + managedFrame.name());

    new Promise(function (resolve) {
        var pageUrlDetails = null;
        var ajaxUrlDetails = null;

        observer = function(details) {
            var urlDetails = function(details) {
                return {
                  url: details.url,
                  tabId: details.tabId,
                  frameId: details.frameId
                };
            };

            if (details.url === pageUrl) {
                pageUrlDetails = urlDetails(details);
            } else if (details.url === ajaxUrl) {
                ajaxUrlDetails = urlDetails(details);
            }

            if ((pageUrlDetails !== null) && (ajaxUrlDetails !== null)) {
                resolve({
                    pageUrlDetails: pageUrlDetails,
                    ajaxUrlDetails: ajaxUrlDetails
                });
            }
        };

        chrome.webRequest.onBeforeRequest.addListener(observer, { urls: ['<all_urls>'] });

        //Rather horrific timeout to give listener time to activate
        setTimeout(function() {
            managedFrame.open(pageUrl);
        }, 1000);


    }).then(function (results) {
        managedFrame.close();
        chrome.webRequest.onBeforeRequest.removeListener(observer);


        var wasSuccess = (results.pageUrlDetails.tabId === results.ajaxUrlDetails.tabId) &&
            (results.pageUrlDetails.frameId === results.ajaxUrlDetails.frameId);

        var message = wasSuccess ? 'tabId+frameId match for framed-page-request and content-script ajax-request' :
                                   'tabId+frameId do not match for framed-page-request and content-script ajax-request';

        var annotatedResults = {
            frameType: managedFrame.name(),
            success: wasSuccess,
            message: message,
            details: results
        };

        console.log('Ran tests: ');
        console.log(JSON.stringify(annotatedResults, null, '\t'));

        resultPort.postMessage(annotatedResults);

        return null;
    });

};

var newIframeInBackgroundPage = function(doc) {

    var managedIframe = iframeLoader.newManagedIframe(doc);

    return {
        name: function() {
            return 'background-page-iframe';
        },
        open: function(url) {
            managedIframe.openUrl(url);
        },
        close: function() {
            managedIframe.destroy();
        }
    };
};

var newIframeInTab = function(isActive) {
    var iframeLoaderTabUrl = chrome.extension.getURL('iframe-load.html');

    var isCreated = new Promise(function(resolve) {
        chrome.tabs.create({ active: isActive, url: iframeLoaderTabUrl }, function(tab) { resolve(tab.id); });
    });

    return {
        name: function() {
            return isActive ? 'iframe-in-active-tab' : 'iframe-in-inactive-tab';
        },
        open: function(url) {
            isCreated.then(function(tabId) {
                var frameUrl = iframeLoader.messagedUrlForListeningManagedIframe(iframeLoaderTabUrl, {
                    url: url
                });

                chrome.tabs.update(tabId, { url: frameUrl });
            });
        },
        close: function() {
            isCreated.then(function(tabId) {
                chrome.tabs.remove(tabId);
            });
        }
    };
};


var newTopLevelFrameInTab = function(isActive) {
    var isCreated = new Promise(function(resolve) {
        chrome.tabs.create({ active: isActive, url: 'about:blank' }, function(tab) { resolve(tab.id); });
    });

    return {
        name: function() {
            return isActive ? 'active-tab' : 'inactive-tab';
        },
        open: function(url) {
            isCreated.then(function(tabId) {
                console.log('Opening: ' + url);
                chrome.tabs.update(tabId, { url: url });
            });
        },
        close: function() {
            isCreated.then(function(tabId) {
                chrome.tabs.remove(tabId);
            });
        }
    };
};

var getManagedFrame = function(type) {
    if (type === 'background-iframe') { return newIframeInBackgroundPage(window.document); }
    if (type === 'inactive-tab-iframe') { return newIframeInTab(false); }
    if (type === 'inactive-tab-top-frame') { return newTopLevelFrameInTab(false); }
    throw new TypeError('Unknown frame type: ' + type);
};

chrome.runtime.onConnect.addListener(function(port) {
    var isRunTestRequest = port.name.lastIndexOf('run-tests#', 0) === 0;
    if (isRunTestRequest) {
        var frameType = port.name.split('#')[1];
        var managedFrame = getManagedFrame(frameType);

        runTests(port, managedFrame);
    }
});

chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.create({ url: chrome.extension.getURL('run-tests.html'), active: true });
});