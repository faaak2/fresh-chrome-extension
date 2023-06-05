// this code will be executed after page load
(function() {
  console.log('after.js executed');

  let noteHeight = 100; // The height of a note box, adjust as needed

  let label;

document.addEventListener('mouseup', function(e) {
  // If the target of the event is a textarea or a label, return early
  if (e.target.tagName.toLowerCase() === 'textarea' || e.target.tagName.toLowerCase() === 'label') {
    return;
  }

  let selection = window.getSelection().toString().trim();
  if (selection) {
    // Remove the existing label, if any
    if (label) {
      document.body.removeChild(label);
    }

    // Create a new "Create note" label
    label = document.createElement('label');
    label.textContent = 'Create note';
    label.style.position = 'absolute';
    label.style.left = e.clientX + 'px'; // Place it at the horizontal position of the selected element
    label.style.top = (e.clientY + window.pageYOffset) + 'px'; // Place it at the vertical position of the selected element
    label.style.cursor = 'pointer';
    label.style.backgroundColor = 'white'; // Give it a white background
    label.style.border = '1px solid black'; // Give it a 1px solid black border
    label.style.padding = '2px'; // Add some padding
    label.addEventListener('click', function() {
      let noteId = Date.now().toString(); // Use the current timestamp as a unique note id
      let desiredTop = e.clientY + window.pageYOffset;

      // Get the existing notes
      let url = window.location.href;
      let notes = localStorage.getItem(url);
      if (notes) {
        notes = JSON.parse(notes);
        let positions = Object.values(notes).map(note => note.y);
        positions.sort((a, b) => a - b);
      
        // Check if the new note would overlap with an existing one
        let overlap;
        do {
          overlap = false;
          for (let i = 0; i < positions.length; i++) {
            if (desiredTop >= positions[i] && desiredTop < positions[i] + noteHeight) {
              // If it would, adjust the position of the new note to place it underneath the existing one
              desiredTop = positions[i] + noteHeight;
              overlap = true;
              break;
            }
          }
        } while (overlap);
      }

      createNoteBox(e.clientX, desiredTop, selection, noteId, true);
      document.body.removeChild(label); // Remove the label
      label = null;
    });
    document.body.appendChild(label);
  }
});

document.addEventListener('mousedown', function(e) {
  // If the target of the event is not the label, remove the label
  if (e.target !== label) {
    if (label) {
      document.body.removeChild(label);
      label = null;
    }
  }
});

  
  
  
  function createNoteBox(x, y, text, noteId, focus) {
    // Create a container for the note box and the delete button
    let noteContainer = document.createElement('div');
    noteContainer.style.position = 'absolute';
    noteContainer.style.right = '0px';
    noteContainer.style.top = y + 'px'; // Set the top position of the container
    document.body.appendChild(noteContainer);
  
    let noteBox = document.createElement('textarea');
    noteBox.style.height = noteHeight + 'px'; // Set the height of the note box
    noteBox.style.backgroundColor = "beige";
    noteBox.value = text;
    noteBox.dataset.noteId = noteId; // Add a custom data attribute to store the note id
    noteBox.id = noteId;
    noteBox.addEventListener('blur', function() {
      saveNote(noteBox.dataset.noteId, noteBox.value, parseInt(noteContainer.style.top));
    });
    noteContainer.appendChild(noteBox);
  
    // Create a delete button
    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.style.visibility = 'hidden'; // Make it initially invisible
    deleteButton.style.position = 'absolute';
    deleteButton.style.right = '5px'; // Place it in the upper-right corner of the note box
    deleteButton.style.top = '5px';
    deleteButton.style.border = 'none';
    deleteButton.style.background = 'none';
    deleteButton.style.cursor = 'pointer';
    deleteButton.addEventListener('click', function() {
      let deleteUrl = new URL(window.location.href);
      let cleanDeleteUrl = new URL(deleteUrl.protocol + '//' + deleteUrl.host + deleteUrl.pathname + deleteUrl.search);
      deleteNote(noteId,cleanDeleteUrl.href);
      document.body.removeChild(noteContainer);
    });
    noteContainer.appendChild(deleteButton);
  
    // Show the delete button when the mouse is over the container
    noteContainer.addEventListener('mouseover', function() {
      deleteButton.style.visibility = 'visible';
    });
  
    // Hide the delete button when the mouse is not over the container
    noteContainer.addEventListener('mouseout', function() {
      deleteButton.style.visibility = 'hidden';
    });
  
    if (focus) {
      noteBox.focus();  
    }
  }
  
  
  
  function saveNote(noteId, note, y) {
    let url = new URL(window.location.href);
    let cleanUrl = new URL(url.protocol + '//' + url.host + url.pathname + url.search);
    chrome.storage.local.get(cleanUrl.href, function(result) {
      let notes = result[cleanUrl.href];
      if (notes) {
        notes = JSON.parse(notes);
      } else {
        notes = {};
      }
      notes[noteId] = { text: note, y: y };
      chrome.storage.local.set({[cleanUrl.href]: JSON.stringify(notes)});
    });
  }
  
  function deleteNote(noteId, urlKey) {
    chrome.storage.local.get(urlKey, function(result) {
      if (result[urlKey]) {
        let notes = JSON.parse(result[urlKey]);
        delete notes[noteId];
        chrome.storage.local.set({[urlKey]: JSON.stringify(notes)});
      }
    });
  }
  
  
  function loadNotes() {
    let url = new URL(window.location.href);
    url.hash = ''; // Remove the fragment identifier
    chrome.storage.local.get(url.href, function(result) {
      let notes = result[url.href];
      if (notes) {
        notes = JSON.parse(notes);
        let i = 0;
        for (let noteId in notes) {
          let note = notes[noteId];
          createNoteBox(0, note.y, note.text, noteId, false);
          i++;
        }
      }
    });
  }
  
  window.addEventListener('load', loadNotes);
  window.addEventListener('hashchange', loadNotes);
  

})();
