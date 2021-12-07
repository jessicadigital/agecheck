var all_cards = [
  {
    age:11,
    cardnum:4000056655665556,
    cvv:323,
    expiry:'12/2021',
    title:'Youngest debit card user in UK'
  },
  {
    age:14,
    cardnum:5200828282828210,
    cvv:837,
    expiry:'03/2023'
  },
  {
    age:17,
    cardnum:4462030000000000,
    cvv:294,
    expiry:'05/2022'
  },
  {
    age:20,
    cardnum:5555555555554444,
    cvv:489,
    expiry:'06/2022'
  },
  {
    age:54,
    cardnum:4242424242424242,
    expiry:'09/2023',
    cvv:337
  }
];
var all_items = [
  {
    age:18,
    icon:'beer.png',
    name:'Beer',
    sku:575676
  },
  {
    age:18,
    icon:'cigarette-pack.png',
    name:'Cigarettes',
    sku:274474
  },
  {
    age:0,
    icon:'dog-bowl.png',
    name:'Dog food',
    sku:326252
  },
  {
    age:0,
    icon:'movie-videos.png',
    ident:'bbfc-u.png',
    name:'DVD',
    sku:039474
  },
  {
    age:0,
    icon:'movie-videos.png',
    ident:'bbfc-pg.png',
    name:'DVD',
    sku:284648
  },
  {
    age:12,
    icon:'movie-videos.png',
    ident:'bbfc-12.png',
    name:'DVD',
    sku:836484
  },
  {
    age:15,
    icon:'movie-videos.png',
    ident:'bbfc-15.png',
    name:'DVD',
    sku:233845
  },
  {
    age:18,
    icon:'movie-videos.png',
    ident:'bbfc-18.png',
    name:'DVD',
    sku:547444
  },
  {
    age:18,
    icon:'festival-fireworks-rocket.png',
    name:'Fireworks',
    sku:399392
  },
  {
    age:18,
    icon:'knife.png',
    name:'Knife',
    sku:773573
  },
  {
    age:18,
    icon:'lotteryticket.png',
    name:'Lottery ticket',
    sku:463563
  },
  {
    age:0,
    icon:'milk.png',
    name:'Milk',
    sku:445372
  },
  {
    age:16,
    icon:'party-hat.png',
    name:'Party poppers',
    sku:783684
  },
  {
    age:18,
    icon:'wine.png',
    name:'Red wine',
    sku:028938
  },
  {
    age:18,
    icon:'scratchcard.png',
    name:'Scratchcard',
    sku:977854
  },
  {
    age:16,
    icon:'adhesive-glue.png',
    name:'Solvents',
    sku:537738
  },
  {
    age:16,
    icon:'aerosol-spray-bottle.png',
    name:'Spray paint',
    sku:764683
  },
  {
    age:0,
    icon:'video-game-gamepad.png',
    ident:'pegi-3.png',
    name:'Video game',
    sku:648466
  },
  {
    age:0,
    icon:'video-game-gamepad.png',
    ident:'pegi-7.png',
    name:'Video game',
    sku:937464
  },
  {
    age:12,
    icon:'video-game-gamepad.png',
    ident:'pegi-12.png',
    name:'Video game',
    sku:354744
  },
  {
    age:16,
    icon:'video-game-gamepad.png',
    ident:'pegi-16.png',
    name:'Video game',
    sku:625532
  },
  {
    age:18,
    icon:'video-game-gamepad.png',
    ident:'pegi-18.png',
    name:'Video game',
    sku:937337
  },
];

function addElementToBasket(el) {
  var $el = $(el);
  var item_num = $el.data('item');
  if ($('.basket_container > .item[data-item='+item_num+']').length) {
    var the_count = parseInt($('.basket_container > .item[data-item='+item_num+']').attr('data-count'))+1;
    $('.basket_container > .item[data-item='+item_num+']').attr('data-count', the_count);
  }
  else {
    if (!$('.basket_container > .item').length) {
      $('.basket_error').fadeOut(300);
    }
    $(el).clone().css({top: 0,left: 0}).appendTo($('div.basket_container'));
  }
}

function calculateMCC() {
  // Clear previous items
  $('#mcc_calculation .age_items').empty();

  // Remove the selection
  $('#mcc_calculation tbody tr').removeClass('selected');

  // Grab the item set
  var items = $('.basket_container .item');
  $(items).each(function () {
    var age_restriction = parseInt($(this).attr('data-agerestricted'));
    $(this).clone().css({top: 0,left: 0}).appendTo($('#mcc_'+age_restriction+' .age_items'));
  });

  // Now count items
  $('#mcc_calculation tbody tr').each(function(){
    var the_count = 0;
    $(this).find('.age_items .item').each(function() {
      the_count = the_count + parseInt($(this).attr('data-count'));
    });
    if (the_count == 0) {
      $(this).find('.age_items').html('No items');
    }
    $(this).find('td:nth-child(4)').html(the_count);
  });

  // Finally choose the correct MCC code
  var ages = $('#mcc_calculation tbody tr');
  var age = 0;
  var mcc = 0;
  for (var i = ages.length; i >= 0; i--) {
    if ($(ages[i]).find('.age_items .item').length) {
      $(ages[i]).addClass('selected');
      age = parseInt($(ages[i]).find('td:nth-child(1)').html());
      if (!age) {
        age = 0;
      }
      $('body').attr('data-age', age);
      $('body').attr('data-mcc', $(ages[i]).find('td:nth-child(2)').html());
      mcc = $(ages[i]).find('td:nth-child(2)').html();
      break;
    }
  }
  if (!age) {
    $('.mcc_comment').html('As there are no age restricted items in the basket, the standard MCC code of <strong>5411</strong> will be used. This is the same as the current situation.');
  }
  else {
    $('.mcc_comment').html('As the most restrictive item in the basket has an age restriction of '+age+', the new MCC code used for the transaction will be <strong>'+$(ages[i]).find('td:nth-child(2)').html()+'</strong>.');
  }
}

function handlePaymentAuth() {
  // Hide the processing dialog
  $('#dialog_processing').dialog('close');
  $('.overlay').fadeOut(200);

  // Decide if payment can proceed
  var cardnum = $('input[name=cardnum]').val();
  var cvv = $('input[name=cvv]').val();
  var expiry = $('input[name=expiry]').val();

  // Find card
  var card = false;
  for (var i = 0; i < all_cards.length; i++) {
    if (all_cards[i]['cardnum'] == cardnum) {
      card = all_cards[i];
      break;
    }
  }

  if (card) {
    // Now validate
    // This is the place where the payment decision is made
    if (card.age >= parseInt($('body').attr('data-age'))) {
      // Approved, redirect to final stage
      $('a[href~="#next"]').click();
    }
    else {
      // Declined
      showDialog('failed');
    }
  }
  else {
    // Card does not exist
    alert('Card does not exist!');
  }
}

// Init functions
function init() {

  // Next button
  $('#steps').on('click', '.nextbtn', function(evt) {
    $('#steps a[href~="#next"]').click();
  });

  // Delete item from basket
  $('#steps').on('click','.basket_container .item', function(evt) {
    removeItem(this);
  });

  // Payment submit
  $('#steps').on('click','.payment_submit', function(evt) {
    var cardnum = $('input[name=cardnum]').val();
    var expiry = $('input[name=Expiry]').val();
    var cvv = $('input[name=cvv]').val();
    if (cardnum == '' || expiry == '' || cvv == '') {
      $('.payment_error').html('Please enter your card details').fadeIn(300);
    }
    else {
      showDialog('processing');
      setTimeout(function() {
        // Handle the payment
        handlePaymentAuth();
      }, 1500+(Math.random()*1500));
    }
    evt.preventDefault();
  });

  // Show dialogs for information
  $('#steps').on('click', 'a[data-dialog]', function(evt) {
    $('#dialog_'+$(this).attr('data-dialog')).dialog({
      classes:{
        'ui-dialog-titlebar-close':($('#dialog_'+$(this).attr('data-dialog')).hasClass('no-close')?'no-close':'')
      },
      close:function() {
        $('.overlay').fadeOut(200);
      },
      hide: {
        effect:'fade',
        duration:200
      },
      show: {
        effect:'fade',
        duration:200
      }
    });
    $('.overlay').fadeIn(200);
    evt.preventDefault();
  });

  // Preset card details on payment screen
  $('#steps').on('click', '.set_card_details', function(evt) {
    $('input[name=cardnum]').val($(this).attr('data-cardnum'));
    $('input[name=expiry]').val($(this).attr('data-expiry'));
    $('input[name=cvv]').val($(this).attr('data-cvv'));
    $('.payment_submit').attr('disabled',false);
    evt.preventDefault();
  });

  $('#steps').on('click', '.return_to_basket', function(evt) {
    evt.preventDefault();
    $('#steps-t-1').click();
  });

  // Setup wizard
  $('#steps').steps({
    autoFocus: true,
    bodyTag: 'section',
    headerTag: 'h3',
    onStepChanging:function(e, currentIndex, newIndex) {
      if (newIndex == 2) {
        if (!$('.basket_container > div').length) {
          $('.basket_error').fadeIn(300);
          return false;
        }
        calculateMCC();
      }
      else if (newIndex == 3) {
        calculateMCC();
      }
      return true;
    },
    transitionEffect: 'slideLeft',
  });
}

function initDraggable() {
    // Let the gallery items be draggable
    $('div.items_container > .item').draggable({
      scope:'basketStep',
      revertDuration: 100,
      start: function( event, ui ) {
        $('div.items > li').draggable('option', 'revert', true );
      },
      cursor: 'move',
      helper:'clone',
      scroll:false,
      appendTo:'body'
    }).dblclick(function() {
      if ($(this).parent().hasClass('items_container')) {
        addElementToBasket(this);
      }
    });

    $('div.basket_container').droppable({
      scope:'basketStep',
      drop:function(evt, ui) {
        addElementToBasket(ui.draggable);
      }
    });
}

function loadCards() {
  var $cards_container = $('.payment_preset ul');
  $(all_cards).each(function(i) {
    var card = all_cards[i];
    var a = $('<a href="#" class="set_card_details">'+card['age']+'</a>')
      .attr('data-age', card['age'])
      .attr('data-cardnum', card['cardnum'])
      .attr('data-cvv', card['cvv'])
      .attr('data-expiry', card['expiry']);
    if (card['title']) {
      $(a).attr('title', card['title']);
    }
    var li = $('<li></li>').append(a);
    $cards_container.append(li);
  });
}

function loadItems() {
  var $items_container = $('.items_container');
  $(all_items).each(function(i) {
    var item = all_items[i];
    var div = $('<div class="item" data-count="1"></div>')
      .attr('data-item',item.sku)
      .attr('data-agerestricted',item.age)
      .attr('data-name', item.name)
      .attr('title',item.name+' ('+(item.age?('age '+item.age):'no restriction')+')')
      .html('<img alt="'+item.name+'" class="item_icon" src="icons/'+item.icon+'" />'+(item.ident?'<img alt="" class="item_ident" src="icons/'+item.ident+'" />':'')+'<div class="caption">'+item.name+'</div>');
    $items_container.append(div);
  });
}

function removeItem(el) {
  $('#dialog_remove .the_item').html($(el).attr('data-name'));
  $('.overlay').fadeIn(200);
  $('#dialog_remove').dialog({
    height:'auto',
    hide: {
      effect:'fade',
      duration:200
    },
    modal:true,
    resizable:false,
    show: {
      effect:'fade',
      duration:200
    },
    width:400,
    buttons: {
      'Remove': function() {
        $(el).remove();
        $(this).dialog('close');
        $('.overlay').fadeOut(200);
      },
      'Cancel': function() {
        $(this).dialog('close');
        $('.overlay').fadeOut(200);
      }
    }
  }).on('dialogclose', function() {
    $('.overlay').fadeOut(200);
  });
}

function showDialog(dialog) {
  $('#dialog_'+dialog).dialog({
    classes:{
      'ui-dialog-titlebar-close':($('#dialog_'+dialog).hasClass('no-close')?'no-close':'')
    },
    close:function() {
      $('.overlay').fadeOut(200);
    },
    hide: {
      effect:'fade',
      duration:200
    },
    show: {
      effect:'fade',
      duration:200
    }
  });
  $('.overlay').fadeIn(200);
}

$(function() {

  // Handle noscript warning
  $('body').removeClass('no-js');

  // Setup functions
  init();
  loadCards();
  loadItems();
  initDraggable();
});
