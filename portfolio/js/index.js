$(document).ready(function() {
  $(".grid .items").isotope({
    itemSelector: ".grid-item",
    percentPosition: true,
    masonry: {
      columnWidth: ".grid-sizer"
    }
  });

  $(".filter-button-group").on("click", "li", function() {
    var filterValue = $(this).attr("data-filter");
    $(".grid").isotope({ filter: filterValue });

    $(".filter-button-group li").removeClass("active");
    $(this).addClass("active");
  });

  $().fancybox({
    selector: '[data-fancybox="gallery"]:visible',
    thumbs: {
      autoStart: false,
    },
    closeClick  : true,
    helpers     : { 
      overlay : {
        closeClick: true
      }
    },
    buttons: ["close"],
  });
});

$('.fancybox-bg').click(function(){
  parent.$.fancybox.close();
});