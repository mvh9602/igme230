/* Don't use <script> tags in a linked js file! */

$(".menuitem").click(function() {
    $(this).next(".submenu").slideToggle("slow");
});

let display = "content1.txt";
$("#choose-content").val(display);
$("#content").load(display);

$("#choose-content").change(function() {
    display = $(this).val();
    $("#content").load(display);
})