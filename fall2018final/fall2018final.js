

$(".menu").click(function() {
    $(this).next(".items").slideToggle("slow");
});

let display = "article0.txt";
$("input").val(display);
$("article").load(display);

$("input").checked(function() {
    display = $(this).val();
    $("article").load(display);
});