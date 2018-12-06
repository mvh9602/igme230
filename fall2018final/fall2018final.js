

$(".menu").click(function() {
    $(this).next(".items").slideToggle("slow");
});

let display = "article0.txt";
$("form").val(display);
$("article").load(display);

$("form").change(function() {
    display = $(this).val();
    $("article").load(display);
});