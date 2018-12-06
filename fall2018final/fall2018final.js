

$(".menu").click(function() {
    $(this).next(".items").slideToggle("slow");
});

let display = "article0.txt";
$("form").val(display);
$("article").load(display);

$("input[type=radio][name=article]").change(function() {
    display = $(this).val();
    $("article").load(display);
});

let count = 0;
$("#count").html(count);
$("#clickme").click(function() {
    count++;
    $("#count").html(count);
})