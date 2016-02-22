# What is this?
This project is a Chrome-browser extension. It tests web-request interception for ajax-calls made from extension content-scripts.
We expect the reported tabId and frameId (of the ajax-call) to match that of the web-page running the content script. 
An iframe is created, either on the extension's background page, or on a visible tab. The iframe loads a web-page, along with a
content script. The content script makes an ajax call. All web-requests are intercepted using a chrome.webRequest.onBeforeRequest listener.
For all intercepted web-requests, we expect the tabId and frameId to match. Chrome 50 behaves as expected.
        
To run this extension, and review the intercepted web-requests:
* Download this extension (git clone..)
* Load this extension into Chrome using chrome://extensions/
* Run a static webserver in the root of the extension's folder. Using Ruby:
  * cd extension-folder-location 
  * ruby -run -ehttpd . -p8000
* Click the extension's button in the browser top-right (a black circle with a 'i' in it)
  * A test web-page will open, showing progress of the test. Or you can see more output by reviewing the extension's log

