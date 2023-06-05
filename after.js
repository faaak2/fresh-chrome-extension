// this code will be executed after page load
(function() {
  console.log('after.js executed');

  let noteHeight = 100; // The height of a note box, adjust as needed

  document.addEventListener('mouseup', function(e) {
    // If the target of the event is a textarea, return early
    if (e.target.tagName.toLowerCase() === 'textarea') {
      return;
    }
  
    let selection = window.getSelection().toString().trim();
    if (selection) {
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
    noteBox.value = text;
    noteBox.dataset.noteId = noteId; // Add a custom data attribute to store the note id
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
      deleteNote(noteId);
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
    let url = window.location.href;
    let notes = localStorage.getItem(url);
    if (notes) {
      notes = JSON.parse(notes);
    } else {
      notes = {};
    }
    notes[noteId] = { text: note, y: y };
    localStorage.setItem(url, JSON.stringify(notes));
  }
  function deleteNote(noteId) {
    let url = window.location.href;
    let notes = localStorage.getItem(url);
    if (notes) {
      notes = JSON.parse(notes);
      delete notes[noteId];
      localStorage.setItem(url, JSON.stringify(notes));
    }
  }
  window.addEventListener('load', function() {
    let url = window.location.href;
    let notes = localStorage.getItem(url);
    if (notes) {
      notes = JSON.parse(notes);
      for (let noteId in notes) {
        let note = notes[noteId];
        createNoteBox(0, note.y, note.text, noteId, false);
      }
    }
  });
  

})();
