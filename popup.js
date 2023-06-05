document.addEventListener('DOMContentLoaded', function() {
    function updatePopup() {
        // Clear existing notes
        document.getElementById('pageNotes').innerHTML = '';
        document.getElementById('domainNotes').innerHTML = '';  
    
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let url = new URL(tabs[0].url);
        url.hash = '';

        function createNoteListItem(noteId, note, urlKey) {
            let listItem = document.createElement('li');
            let noteText = note.text.substring(0, 20) + '...';
            let link = document.createElement('a');
            link.href = '#';
            link.textContent = noteText + ' - ' + new URL(urlKey).pathname;
            link.addEventListener('click', function() {
            chrome.tabs.update(tabs[0].id, {url: urlKey + '#' + noteId});
            });
            listItem.appendChild(link);
    
            let deleteIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            deleteIcon.setAttribute('viewBox', '0 0 1000 1000');
            deleteIcon.setAttribute('width', '16');
            deleteIcon.setAttribute('height', '16');
            deleteIcon.setAttribute('fill', 'black');
            deleteIcon.innerHTML = '<path d="M0 281.296l0 -68.355q1.953 -37.107 29.295 -62.496t64.449 -25.389l93.744 0l0 -31.248q0 -39.06 27.342 -66.402t66.402 -27.342l312.48 0q39.06 0 66.402 27.342t27.342 66.402l0 31.248l93.744 0q37.107 0 64.449 25.389t29.295 62.496l0 68.355q0 25.389 -18.553 43.943t-43.943 18.553l0 531.216q0 52.731 -36.13 88.862t-88.862 36.13l-499.968 0q-52.731 0 -88.862 -36.13t-36.13 -88.862l0 -531.216q-25.389 0 -43.943 -18.553t-18.553 -43.943zm62.496 0l749.952 0l0 -62.496q0 -13.671 -8.789 -22.46t-22.46 -8.789l-687.456 0q-13.671 0 -22.46 8.789t-8.789 22.46l0 62.496zm62.496 593.712q0 25.389 18.553 43.943t43.943 18.553l499.968 0q25.389 0 43.943 -18.553t18.553 -43.943l0 -531.216l-624.96 0l0 531.216zm62.496 -31.248l0 -406.224q0 -13.671 8.789 -22.46t22.46 -8.789l62.496 0q13.671 0 22.46 8.789t8.789 22.46l0 406.224q0 13.671 -8.789 22.46t-22.46 8.789l-62.496 0q-13.671 0 -22.46 -8.789t-8.789 -22.46zm31.248 0l62.496 0l0 -406.224l-62.496 0l0 406.224zm31.248 -718.704l374.976 0l0 -31.248q0 -13.671 -8.789 -22.46t-22.46 -8.789l-312.48 0q-13.671 0 -22.46 8.789t-8.789 22.46l0 31.248zm124.992 718.704l0 -406.224q0 -13.671 8.789 -22.46t22.46 -8.789l62.496 0q13.671 0 22.46 8.789t8.789 22.46l0 406.224q0 13.671 -8.789 22.46t-22.46 8.789l-62.496 0q-13.671 0 -22.46 -8.789t-8.789 -22.46zm31.248 0l62.496 0l0 -406.224l-62.496 0l0 406.224zm156.24 0l0 -406.224q0 -13.671 8.789 -22.46t22.46 -8.789l62.496 0q13.671 0 22.46 8.789t8.789 22.46l0 406.224q0 13.671 -8.789 22.46t-22.46 8.789l-62.496 0q-13.671 0 -22.46 -8.789t-8.789 -22.46zm31.248 0l62.496 0l0 -406.224l-62.496 0l0 406.224z"/>';
            deleteIcon.addEventListener('click', function() {
                chrome.storage.local.get(urlKey, function(result) {
                let notes = JSON.parse(result[urlKey]);
                delete notes[noteId];
                chrome.storage.local.set({[urlKey]: JSON.stringify(notes)}, function() {
                    listItem.remove();
                });
                });
            });
            listItem.appendChild(deleteIcon);
    
            return listItem;
        }
    
        
        chrome.storage.local.get(url.href, function(result) {
            let notes = result[url.href];
            if (notes) {
            notes = JSON.parse(notes);
            let noteList = document.getElementById('pageNotes');
            for (let noteId in notes) {
                let note = notes[noteId];
                let listItem = createNoteListItem(noteId, note, url.href);
                noteList.appendChild(listItem);
            }
            }
        });
    
        let domain = url.hostname;
        let domainNotes = {};
        chrome.storage.local.get(null, function(result) {
            for (let key in result) {
             if (new URL(key).hostname === domain && key !== url.href) {
                let notes = JSON.parse(result[key]);
                for (let noteId in notes) {
                    let note = notes[noteId];
                 domainNotes[noteId] = {note: note, urlKey: key};
                }
             }
            }
            if (Object.keys(domainNotes).length > 0) {
               let domainNoteList = document.getElementById('domainNotes');
                for (let noteId in domainNotes) {
                    let noteData = domainNotes[noteId];
                    let listItem = createNoteListItem(noteId, noteData.note, noteData.urlKey);
                    domainNoteList.appendChild(listItem);
                }
            }
        });
    });
}
    updatePopup();
    
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      if (changeInfo.status === 'complete' && tab.active) {
        updatePopup();
      }
    });

});
  
  



  