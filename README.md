# What is this?
This project is a Chrome-browser extension. It tests that - for intercepted web-requests - the tabId+frameId are correct for
a web-page loaded in an iframe, and any ajax requests made from that web-page. An iframe is created, either on the extension's background page, or on a visible tab. 
 The iframe loads a web-page, which makes an ajax call. Both web-requests are intercepted using a chrome.webRequest.onBeforeRequest listener.
 For both intercepted web-requests, we expect the tabId and frameId to match. Chrome 50 behaves as expected.
        
To run this extension, and review the message-passing:
* Download this extension (git clone..)
* Load this extension into Chrome using chrome://extensions/
* Click the extension's button in the browser top-right (a black circle with a 'i' in it)
  * A test web-page will open, showing progress of the test. Or you can see more output by reviewing the extension's log
