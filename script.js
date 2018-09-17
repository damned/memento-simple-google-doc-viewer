function appendText(text) {
  var content = document.getElementById('content');
  var para = document.createElement("P");
  var textContent = document.createTextNode(text);
  para.appendChild(textContent)
  content.appendChild(para);
};

function appendImage(imageUrl) {
  var content = document.getElementById('content');
  var img = document.createElement("IMG");
  img.setAttribute('src', imageUrl);
  content.appendChild(img);
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

    doc.querySelectorAll('img, p').forEach((el) => {
      console.log(el.tagName)
      if (el.tagName.toLowerCase() == 'img') {
        appendImage(el.attributes.src.value)
      }
      else {
        let text = el.textContent.trim()
        if (text !== '') {
          appendText(text)
        }
      }
    })
  };

};
window.docViewer = new DocViewer();