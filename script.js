function appendText(text) {
  var content = document.getElementById('content');
  var para = document.createElement("P");
  var textContent = document.createTextNode(text);
  para.appendChild(textContent)
  content.appendChild(para);
  return {
    addBubble: (msg) => { console.log(`Cannot add bubble "${msg}" to text element`) }
  };
};

function appendImage(imageUrl) {
  var content = document.getElementById('content');
  var container = document.createElement("DIV");
  var img = document.createElement("IMG");
  container.appendChild(img);
  img.setAttribute('src', imageUrl);
  content.appendChild(container);
  return {
    addBubble: (msg) => {
      let bubble = document.createElement('DIV')
      container.setAttribute('class', 'bubble-container');
      bubble.appendChild( document.createTextNode(msg));
      bubble.setAttribute('class', 'bubble');
      container.appendChild(bubble);
    }
  };
};

/* global gapi */
class DocViewer {
  constructor() {
    this.CLIENT_ID = '368268654072-iss2aqp3nbuf8m54favjjr7gg0b670s5.apps.googleusercontent.com';
    this.API_KEY = 'AIzaSyD7tKUgp5A22NIe8qKHQ5KRiYWvLWEEfdo';
    this.SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

    //DOM Elements
    this.authorizeButton = document.querySelector('.authorize-button');
    this.googleDocDriveFileId = document.querySelector('#file-id').value;
  };

  handleClientLoad() {
    gapi.load('client:auth2', 
              () => gapi.client.load('drive', 'v3', this.initClient.bind(this)));
  };

  /**
   *  Initializes the API client library and sets up sign-in state listeners.
   */
  initClient() {
    gapi.client.init({
      apiKey: this.API_KEY,
      clientId: this.CLIENT_ID,
      scope: this.SCOPES,
    }).then(() => {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus.bind(this));
      this.setSignInListeners();
      // Handle the initial sign-in state.
      this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
  };

  setSignInListeners() {
    document.addEventListener('click', evt => {
      if (evt.target.className === this.authorizeButton.className)
        gapi.auth2.getAuthInstance().signIn();
    });
  };

  updateSigninStatus(isSignedIn) {
    this.authorizeButton.style.display = isSignedIn ? 'none' : 'block';

    if (!isSignedIn) {
      return;
    }
    this.displayGoogleDoc();
  };

  displayGoogleDoc() {
    gapi.client.drive.files.export({
      'fileId': this.googleDocDriveFileId,
      'mimeType': 'text/html'
    }).then((response) => {
      let docAsHtml = response.body;
      this.displaySimplifiedHtml(docAsHtml);
    });
  };
  
  displaySimplifiedHtml(html) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(html, "text/html");
    let lastContent = { addBubble: () => { console.log('Bubble defined but no last content')}};
    
    doc.querySelectorAll('img, p').forEach((el) => {
      console.log(el.tagName)
      if (el.tagName.toLowerCase() == 'img') {
        lastContent = appendImage(el.attributes.src.value)
      }
      else {
        let text = el.textContent.trim()
        if (text[0] == '(') {
          let inner = text.replace(/^\(/, '').replace(/\)$/, '')
          lastContent.addBubble(inner)
        }
        else if (text !== '') {
          lastContent = appendText(text)
        }
      }
    })
  };

};
window.docViewer = new DocViewer();