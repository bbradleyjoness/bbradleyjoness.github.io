$(document).ready(function() {
  $.getJSON(
    "https://api.sheety.co/22a66d4d-9e53-4b5e-85ff-1e4ce0ff7c8f",
    function(data) {
      var template = Handlebars.compile($("#item-template").html());
      $(".content").html(template(data));

      $(".grid").isotope({
        itemSelector: ".grid-item",
        percentPosition: true,
        masonry: {
          columnWidth: ".grid-sizer"
        }
      });
    }
  );

  $(".filter-button-group").on("click", "a", function() {
    var filterValue = $(this).attr("data-filter");
    $(".grid").isotope({ filter: filterValue });

    $(".filter-button-group a").removeClass("active");
    $(this).addClass("active");
  });

  $().fancybox({
    selector: '[data-fancybox="gallery"]:visible',
    thumbs: {
      autoStart: false
    },
    closeClick: true,
    helpers: {
      overlay: {
        closeClick: true
      }
    },
    buttons: ["close"]
  });

  $(".fancybox-bg").click(function() {
    parent.$.fancybox.close();
  });
});
