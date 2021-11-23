$(document).ready(function () {
	$(".join-meeting").on("click", function (e) {
		e.preventDefault();
		$(".enter-code").focus();
	});
	$(".join-action").on("click", function () {
		var join_value = $(".enter-code").val();
		var meetingUrl = window.location.origin + "/" + join_value;
		window.location.replace(meetingUrl);
	});

	$(".enter-code").on("click", function (e) {
		e.preventDefault();
	});

	$(".top-left-chat-wrap").on("click", function () {
		$(".chat-title").css("visibility", "hidden");
		$(".chat-box").css("visibility", "visible");
		$(".g-top-left").css("border-bottom-left-radius", "0px");
		$(".top-remote-video-show-wrap").removeClass(
			"top-remote-video-show-center"
		);
	});

	$(".meeting-heading-cross").on("click", function () {
		$(".chat-title").css("visibility", "visible");
		$(".chat-box").css("visibility", "hidden");
		$(".g-top-left").css("border-bottom-left-radius", "5px");
		$(".top-remote-video-show-wrap").addClass(
			"top-remote-video-show-center"
		);
	});
	$("body").on("DOMSubtreeModified", ".video-container", function () {
		$(".video-container").each(function (i, obj) {
			if ($(obj).find("video").length === 0) {
				// $(obj).find(".overlay").html("");
				$(obj).remove();
			}
		});
	});
});
