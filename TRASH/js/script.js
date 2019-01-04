
// JS
const items = document.querySelectorAll('.slider-item');
const itemCount = items.length;
const nextItem = document.querySelector('.next');
const previousItem = document.querySelector('.previous');
const navItem = document.querySelector('a.toggle-nav');
let count = 0;

function showNextItem() {
  items[count].classList.remove('active');

  if(count < itemCount - 1) {
    count++;
  } else {
    count = 0;
  }

  items[count].classList.add('active');
  console.log(count);
}

function showPreviousItem() {
  items[count].classList.remove('active');

  if(count > 0) {
    count--;
  } else {
    count = itemCount - 1;
  }

  items[count].classList.add('active');
  // Check if working...
  console.log(count);
}

function toggleNavigation(){
  this.nextElementSibling.classList.toggle('active');
}

nextItem.addEventListener('click', showNextItem);
previousItem.addEventListener('click', showPreviousItem);
navItem.addEventListener('click', toggleNavigation);








// if visible function

var win    = $(window),
    $body  = $('body'),
    $slide = $(".out");

$.fn.isOnScreen = function(){

    var viewport = {
        top : win.scrollTop(),
        left : win.scrollLeft()
    };

    viewport.bottom = viewport.top + win.height();

    var bounds = this.offset();
    bounds.bottom = bounds.top + this.outerHeight();

    return (!(viewport.bottom < bounds.top || viewport.top > bounds.bottom));

};


// if image is on screen

$slide.each(function(i, el) {
  var $element  = $(this),
      $anchor = $element.find('span');

  if ( ($anchor.isOnScreen()) ) {
    $element
      .addClass("in")
      .removeClass("out");
  }

  win.scroll(function() {
    $('.down').addClass('out');
    if ( ($anchor.isOnScreen()) ) {
      $element
      .addClass("in")
      .removeClass("out");
    }
  });

});



//----MODAL OPEN----//
//------------------//
var image     = $(".image"),
    $modal    = $('.modal'),
    $modImage = $('.modal-image'),
    author    = $('#author');


image.on('click', function(e) {

  var $this           = $(this).find('img'),
      src             = $this.attr("src"),
      tarAuthor         = $this.attr('data-author'),
      $author         = $('#'+tarAuthor).text(),
      $authLink       = $('#'+tarAuthor).attr('href'),
      scrolled        = win.scrollTop(),
      targetHeight    = $(this).height(),
      x = $(this).offset().left,
      y = $(this).offset().top,
      $image = $modImage.find('img');

  $body.addClass('no-scroll');
  $modal.removeClass('out');
  author.text($author).attr('href', $authLink);
  $modImage.css({'transform' : 'translate3d(0,0,0) scale3d(1,1,1)'});
  $image.attr("src", '');
  $image.attr("src", src);

  var imageHeight = $modImage.height(),
      imageWidth  = $modImage.width(),
      $scale      = (100 / imageHeight) * targetHeight / 100,
      position    = $modImage.offset(),
      $left       = x - position.left,
      $top        = y - position.top;

  $modImage.css({
    'transform' : ' translate3d('+$left+'px,'+$top+'px,0) scale3d(' + $scale + ',' + $scale + ',1)'
  });

  setTimeout(function(){
    $this.css('opacity','0');
    $modal.addClass('in');
    $modImage.css({
      'transform' : 'scale3d(1,1,1) translate3d(0,0,0)'
    });
  }, 100);

  $('.modal-back').on('click', function(e) {
    $modal.addClass('out').removeClass('in');
    $modImage.css({
    'transform' : ' translate3d('+$left+'px,'+$top+'px,0) scale3d(' + $scale + ',' + $scale + ',1)'
  });

    setTimeout(function(){
      $body.removeClass('no-scroll');
      $this.css('opacity','1');
    }, 100);

//     setTimeout(function(){
//       $modal.removeClass('out')
//     }, 800);
  });

});



// MODERNIZR FALLBACKS - if doesn't support clip-path

(function(Modernizr){
  // FROM: https://codepen.io/shshaw/pen/yyOaqW
  // Here are all the values we will test. If you want to use just one or two, comment out the lines of test you don't need.
  var tests = [
    { name: 'svg', value: 'url(#test)' }, // False positive in IE, supports SVG clip-path, but not on HTML element
    { name: 'inset', value: 'inset(10px 20px 30px 40px)' },
    { name: 'circle', value: 'circle(60px at center)' },
    { name: 'ellipse', value: 'ellipse(50% 50% at 50% 50%)' },
    { name: 'polygon', value: 'polygon(50% 0%, 0% 100%, 100% 100%)' }
    ];

    var t = 0,
    name, value, prop;

    for (; t < tests.length; t++) {
      name = tests[t].name;
      value = tests[t].value;
      Modernizr.addTest('cssclippath' + name, function(){
      // Try using window.CSS.supports
      if ( 'CSS' in window && 'supports' in window.CSS ) {
        for (var i = 0; i < Modernizr._prefixes.length; i++) {
          prop = Modernizr._prefixes[i] + 'clip-path';

          if ( window.CSS.supports(prop,value) ) { return true; }
        }
        return false;
      }
      // Otherwise, use Modernizr.testStyles and examine the property manually
      return Modernizr.testStyles('#modernizr { '+Modernizr._prefixes.join('clip-path:'+value+'; ')+' }',function(elem, rule) {
        var style = getComputedStyle(elem),
        clip = style.clipPath;

        if ( !clip || clip == "none" ) {
          clip = false;

          for (var i = 0; i < Modernizr._domPrefixes.length; i++) {
            test = Modernizr._domPrefixes[i] + 'ClipPath';
            if ( style[test] && style[test] !== "none" ) {
              clip = true;
              break;
            }
          }
        }

        return Modernizr.testProp('clipPath') && clip;
      });
    });
  }
})(Modernizr);

if (Modernizr.cssclippathsvg) {
  document.documentElement.className += ' cssclippathsvg';
}

if (Modernizr.cssclippathinset) {
  document.documentElement.className += ' cssclippathinset';
}

if (Modernizr.cssclippathcircle) {
  document.documentElement.className += ' cssclippathcircle';
}

if (Modernizr.cssclippathellipse) {
  document.documentElement.className += ' cssclippathellipse';
}

if (Modernizr.cssclippathpolygon) {
  document.documentElement.className += ' cssclippathpolygon';
}


$(function() {
  $('a[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 500);
        return false;
      }
    }
  });
});
