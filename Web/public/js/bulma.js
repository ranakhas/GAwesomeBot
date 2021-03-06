window.bulma = () => {
	const $toggle = $("#nav-toggle");
	const $menu = $("#nav-menu");

	$toggle.click(function handler () {
		$(this).toggleClass("is-active");
		$menu.slideToggle(86);
	});

	$(".modal-button").click(function handler () {
		const target = $(this).data("target");
		$("html").addClass("is-clipped");
		$(target).addClass("is-active");
	});

	$(".modal-background, .modal-close").click(function handler () {
		if ($(this).parent().attr("id") === "installer-modal") return;
		if ($(this).parent().hasClass("command-item-modal")) GAwesomeUtil.dashboard.updateCommandSettings($(this).parent(), $($(this).parent().data("target")));
		$("html").removeClass("is-clipped");
		$(this).parent().removeClass("is-active");
	});

	$(".modal-card-head .delete, .modal-card-foot .button").click(() => {
		$("html").removeClass("is-clipped");
		$("#modal-ter").removeClass("is-active");
	});

	$("[data-toggle-gfa]").click(function handler () {
		const toggleSwitch = $(this);
		const targetAddon = $(`#${toggleSwitch.data("toggle-gfa")}`);
		if (!targetAddon[0]) return;
		targetAddon.slideToggle();
	});
	$("[data-toggle-gfba]").click(function handler () {
		const toggleSwitch = $(this);
		const targetAddon = $(`#${toggleSwitch.data("toggle-gfba")}`);
		if (!targetAddon[0]) return;
		const isDisabled = targetAddon.attr("disabled");
		if (isDisabled) targetAddon.removeAttr("disabled");
		else targetAddon.attr("disabled", true);
	});
};
