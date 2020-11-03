function myFunction() {
  var element = document.body;
  var LOGO_black = document.getElementById("blackLOGO");
  var LOGO_white = document.getElementById("whiteLOGO");
  var ICON_night = document.getElementById("nightICON");
  var ICON_day = document.getElementById("dayICON");

  element.classList.toggle("dark-mode");

  if (LOGO_black.style.display === "none") {
    LOGO_black.style.display = "block";
  } else {
    LOGO_black.style.display = "none";
  }

  if (LOGO_white.style.display === "block") {
    LOGO_white.style.display = "none";
  } else {
    LOGO_white.style.display = "block";
  }

  if (ICON_night.style.display === "none") {
    ICON_night.style.display = "block";
  } else {
    ICON_night.style.display = "none";
  }

  if (ICON_day.style.display === "block") {
    ICON_day.style.display = "none";
  } else {
    ICON_day.style.display = "block";
  }
}
