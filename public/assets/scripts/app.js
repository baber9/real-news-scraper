// Click function for scraping newsmax


// Scrape Button Handler
$(document).on('click', '#scraper', e => {
    e.preventDefault();
    $.get('/scrape').then(data => {
        $('.article').remove();
        alert(data);
        $.get('/').then(() => {
            location.reload();
        });
    });
});

// Save Article Button Handler
$(document).on('click', '#save-article', e => {
    e.preventDefault();

    let thisArticle = $(e.currentTarget).parent().parent().attr('data-id');

    $.post('/save-article/' + thisArticle).then(data => {
        location.reload();
    });
});

// UnSave Article Button Handler (on Saved Articles page)
$(document).on('click', '.unsave-article', e => {
    e.preventDefault();

    // set articleID
    const thisArticle = $(e.currentTarget).parent().parent().attr('data-id');

    // delete all notes realted to this article
    $.post(/delete-notes/ + thisArticle)
       
    // unsave article
    $.post('/unsave-article/' + thisArticle).then(data => {
        location.reload();
    });

});

// Modal Handler to edit/save/remove notes (on Saved Articles page)
$('.open-notes-button').on('click', e => {
    e.preventDefault();

    // clear modal ul & textarea
    $('.current-notes').children().remove();    
    $('#new-note').val('');

    // set thisArticle to el data-id (articleId)
    let thisArticle = $(e.currentTarget).parent().parent().attr('data-id');

    // load header with this articles id
    $('#notes-label').text(`Notes for Article: ${thisArticle}`);
    
    // set button data-id to article id
    $('#save-note-button').attr('data-id', thisArticle);

    // call get route and populate notes
    $.get('/notes/' + thisArticle).then(data => {
        
        // if notes to display
        if(data) {

            // loop through all notes
            for (i = 0; i < data.length; i++) {

                // create list item with classes
                const listItem = $('<li class="list-group-item note">');
                // create button
                const button = $('<button class="btn btn-danger note-delete">x</button>');
                // add data-id of the noteId to button
                button.attr('data-id', data[i]._id);
                // add note text
                listItem.text(data[i].note);
                // append button to li
                listItem.append(button);
                // append listItem
                $('ul.current-notes').append(listItem);

            }
        // no notes, leave blank
        } else {
            $('.current-notes').val('');
        }
    });
});

// MODAL - Delete single note (removes from Notes db)
$(document).on('click', '.note-delete', (e) => {
    e.preventDefault();
    
    // assign current el
    const currentEl = $(e.currentTarget);
    // assign data-id (noteID)
    const id = $(e.currentTarget).attr('data-id');

    // call to route to remove note from db
    $.post('/delete-note/' + id).then(() => {
        // remove element from modal
        currentEl.parent().remove();
    });
});

// MODAL - Save Note button (saves note to db)
$('.save-note-button').on('click', (e) => {
    e.preventDefault();

    // set id to data-id of article
    const id = $(e.currentTarget).attr('data-id');

    // set not to text area val
    const note = $(e.currentTarget).parent().siblings('.modal-body').children().children().children('#new-note').val();

    // create note obj
    const noteObj = {
        articleId: id,
        note: note
    }

    // save note
    $.post('/save-note', noteObj, (data) => {
        console.log(data);
    }).then(() => {
        // clear textarea entry
        $('#new-note').val('');
        // close modal
        $('#notes-modal').modal('toggle');
    });
});