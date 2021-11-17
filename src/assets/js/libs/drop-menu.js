console.log('drop-menu is work');

// window.addEventListener("resize", function() {
//   if (window.matchMedia("(max-width: 700px)").matches) {
//     document.querySelectorAll('.header__dropdown').forEach((el) => {
//       el.classList.remove("header__dropdown")
//       el.classList.add("mpIt", "mpId22")
//     })
//   } else {
//     document.querySelectorAll('.header__dropdown').forEach((el) => {
//       el.classList.remove("header__dropdown")
//       el.classList.add("mpIt", "mpId21")
//     })
//   } return
// },);


function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}
// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
if (!event.target.matches('.dropbtn')) {

  var dropdowns = document.getElementsByClassName("dropdown-content");
  var i;
  for (i = 0; i < dropdowns.length; i++) {
    var openDropdown = dropdowns[i];
    if (openDropdown.classList.contains('show')) {
      openDropdown.classList.remove('show');
    }
  }
}
}

