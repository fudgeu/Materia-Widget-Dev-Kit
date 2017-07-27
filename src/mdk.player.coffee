Namespace('Materia').Player = do ->
	base_url = null
	converted_instance = null
	embed_done_dfd = null
	embed_target = null
	inst_id = null
	instance = null
	is_embedded = false
	is_preview = false
	log_interval = 10000
	no_flash = false
	pending_logs =
	play: []
	storage: []
	play_id = null
	qset = null
	start_time = 0
	widget = null
	widget_type = null
	end_state = null
	end_logs_pending = false
	score_screen_pending = false
	end_logs_sent = false
	heartbeat_interval_id = -1
	score_screen_url = null

	init = (_gateway, _inst_id, _embed_target, _base_url) ->
		embed_target = _embed_target
		inst_id = _inst_id
		base_url = _base_url

		Materia.Package.init()

		for word in String(window.location).split('/')
			if word == 'preview'
				is_preview = true
				$('body').addClass 'preview'
				$('.center').prepend $('<header>').addClass('preview-bar')
				break
		is_embedded = top.location isnt self.location
		$.when(getWidgetInstance(), startPlaySession())
			.pipe(getQuestionSet)
			.pipe(embed)
			.pipe(sendWidgetInit)
			.pipe(startHeartBeat)
			.fail(onLoadFail)

	getWidgetInstance = ->
		dfd = $.Deferred()

		if no_flash
			dfd.reject 'Flash Player required.'

		Materia.Coms.Json.send 'api/json/widget_instances_get', [[inst_id]], (instances) ->
			if instances.length < 1
				dfd.reject 'Unable to get widget info.'

			instance = instances[0]

			type = instance.widget.player.split('.').pop()

			version = parseInt instance.widget.files.flash_version, 10
			if type == 'swf' && swfobject.hasFlashPlayerVersion(String(version)) == false
				dfd.reject 'Newer Flash Player version required.'
			else
				if instance.widget.width > 0
					$('.center').width instance.widget.width
				if instance.widget.height > 0
					$('.center').height instance.widget.height
				dfd.resolve()
			$('.widget').show()

		dfd.promise()

	startPlaySession = ->
		dfd = $.Deferred()
		switch
			when no_flash then dfd.reject 'Flash Player Required.'
			when is_preview then dfd.resolve()
			else
				play_id = __PLAY_ID

				if play_id?
					dfd.resolve()
				else
					dfd.reject 'Unable to start play session.'

		dfd.promise()

	getQuestionSet = ->
		dfd = $.Deferred()
		Materia.Coms.Json.send 'api/json/question_set_get', [inst_id, play_id], (result) ->
			if window.qset
				qset = window.qset
				dfd.resolve()
			qset = result
			document.getElementById('qset').innerHTML = JSON.stringify result, null, 2

			# make sure every question is given an explicit id if it doesn't have one already
			for index, question of qset.data.items
				question.id = +index if question.id is null

			dfd.resolve()
		dfd.promise()

	embed = ->
		dfd = $.Deferred()
		widget_type = instance.widget.player.slice instance.widget.player.lastIndexOf('.')
		embedHTML dfd
		dfd.promise()

	embedHTML = (dfd) ->
		embed_done_dfd = dfd
		iframe = $('<iframe src="/player.html" id="container" class="html"></iframe>')
		$('#container').replaceWith iframe
		a = document.createElement 'a'
		a.href = STATIC_CROSSDOMAIN
		expected_origin = a.href.substr 0, a.href.length - 1
		onPostMessage = (e) ->
			if e.origin == expected_origin
				msg = JSON.parse e.data
				switch msg.type
					when 'start' then onWidgetReady()
					when 'addLog' then addLog msg.data
					when 'end' then end msg.data
					when 'sendStorage' then sendStorage msg.data
					when 'sendPendingLogs' then sendPendingLogs()
					when 'alert' then alert msg.data
					when 'setHeight' then setHeight msg.data[0]
					else throw new Error 'Unknown PostMessage received from player core: '+ msg.type
			else
				throw new Error 'Post message Origin does not match. Expected: ' + expected_origin + ', Actual: ' + e.origin
		if typeof addEventListener isnt 'undefined' and addEventListener isnt null
			addEventListener 'message', onPostMessage, false
		else if typeof attachEvent isnt 'undefined' and attachEvent isnt null
			attachEvent 'onmessage', onPostMessage

	sendWidgetInit = ->
		dfd = $.Deferred().resolve()
		converted_instance = translateForApiVersion instance
		start_time = new Date().getTime()
		sendToWidget 'initWidget', [qset, converted_instance, base_url]
		if not is_preview
			heartbeat_interval_id = setInterval sendPendingLogs, log_interval

	startHeartBeat = ->
		dfd = $.Deferred().resolve()
		heartbeat = setInterval ->
			Materia.Coms.Json.send 'api/json/session_valid', [null, false], (data) ->
				if data != true
					alert 'You have been logged out due to inactivity.\n\nPlease log in again.'
					stopHeartBeat()
		, 30000
		dfd.promise()

	onLoadFail = (msg) ->
		alert 'Failure: ' + msg

	onWidgetReady = ->
		widget = $('#container').get 0

		# override engine core's getImageAssetUrl method to handle hardcoded demo assets properly
		widget.contentWindow.Materia.Engine.getImageAssetUrl = (id) ->
			if id.indexOf 'MEDIA=' isnt -1
				id = id.split "'"
				id[1]
			else
				"#{base_url}mdk/media/#{id}"

		switch
			when qset is null then embed_done_dfd.reject 'Unable to load widget data.'
			when widget is null then embed_done_dfd.reject 'Unable to load widget.'
			else embed_done_dfd.resolve()

	# converts current widget/instance structure to the one expected by the player
	translateForApiVersion = (inst) ->
		# switch based on version expected by the widget
		switch parseInt inst.widget.api_version
			when 1
				output =
					startDate: inst.open_at
					playable: inst.widget.is_playable
					embedUrl: inst.embed_url
					engineName: inst.widget.name
					endDate: inst.close_at
					GRID: inst.widget.id
					type: inst.widget.type
					dateCreate: inst.created_at
					version: ''
					playUrl: inst.play_url
					QSET: inst.qset
					isDraft: inst.is_draft
					height: inst.widget.height
					dir: inst.group
					storesData: inst.widget.is_storage_enabled
					name: inst.name
					engineID: inst.widget.id
					GIID: inst.id
					flVersion: inst.flash_version
					isQSetEncrypted: inst.widget.is_qset_encrypted
					cleanName: inst.widget.clean_name
					attemptsAllowed: inst.attempts
					recordsScores: inst.widget.is_scorable
					width: inst.widget.width
					isAnswersEncrypted: inst.widget.is_answer_encrypted
					cleanOwner: ''
					editable: inst.widget.is_editable
					previewUrl: inst.preview_url
					userID: inst.user_id
					scoreModule: inst.widget.score_module
			else
				output = inst
		output

	sendToWidget = (type, args) ->
		switch widget_type
			when '.swf' then widget[type].apply widget, args
			when '.html' then widget.contentWindow.postMessage JSON.stringify({type: type, data: args}), STATIC_CROSSDOMAIN

	sendPendingLogs = (callback) ->
		if callback is null
			callback = $.noop
		$.when(sendPendingStorageLogs())
			.pipe(sendPendingPlayLogs)
			.done(callback)
			.fail ->
				alert 'There was a problem saving'

	sendPendingStorageLogs = ->
		dfd = $.Deferred()
		if not is_preview and pending_logs.storage.length > 0
			Materia.Coms.Json.send 'api/json/play_storage_data_save', [play_id, pending_logs.storage], ->
				dfd.resolve()
			pending_logs.storage = []
		else
			dfd.resolve()
		dfd.promise()

	sendPendingPlayLogs = ->
		dfd = $.Deferred()
		if pending_logs.play.length > 0
			args = [play_id, pending_logs.play]
			if is_preview
				args.push inst_id
			Materia.Coms.Json.send 'api/json/play_logs_save', args, (result) ->
				if result isnt null and result.score_url?
					score_screen_url = result.score_url
				dfd.resolve()
			pending_logs.play = []
		else
			dfd.resolve()
		dfd.promise()

	sendAllPendingLogs = (callback) ->
		callback = $.noop if !callback?

		$.when(sendPendingStorageLogs())
			.pipe(sendPendingPlayLogs)
			.done(callback)
			.fail ->
				alert 'There was a problem saving.'

	setHeight = (h) ->
		$('#container').height h

	addLog = (log) ->
		log['game_time'] = ((new Date()).getTime() - start_time) / 1000 # log time in seconds
		pending_logs.play.push log

	showPackageDownload = ->
		embed = $('<iframe src="/package" id="embed_dialog" frameborder=0 width=500 height=280></iframe>')
		embed.load ->
			return embed.css('top', '30%').css('opacity', 1).css('margin-left', '-250px')
		$('body').append embed
		$('#modalbg').show();

	onPackageDownloadComplete = ->
		$('#embed_dialog').remove();
		$('#modalbg').hide()

	end = (show_score_screen_after = yes) ->
		switch end_state
			when 'sent'
				showScoreScreen() if show_score_screen_after
			when 'pending'
				if show_score_screen_after then score_screen_pending = yes
			else
				end_state = 'pending'
				# kill the heartbeat
				clearInterval heartbeat_interval_id
				# required to end a play
				addLog({type:2, item_id:0, text:'', value:null})
				# send anything remaining
				sendAllPendingLogs ->
					# Async callback after final logs are sent
					end_state = 'sent'
					# shows the score screen upon callback if requested any time betwen method call and now
					if show_score_screen_after or score_screen_pending then showScoreScreen()

	showScoreScreen = ->
		if score_screen_url is null
			if is_preview
				score_screen_url = '' + BASE_URL + 'mdk/scores/preview/' + inst_id
			else if is_embedded
				score_screen_url = '' + BASE_URL + 'mdk/scores/embed/' + inst_id
			else
				score_screen_url = '' + BASE_URL + 'mdk/scores/' + inst_id
		window.location = score_screen_url

	init: init
	onPackageDownloadComplete: onPackageDownloadComplete

# DEFINE GLOBALS
window.storageData = {};
window.currentSelectedTable = "";

window.hideSidebar = () =>
	leftbar = document.getElementById("leftbar")
	btn = document.getElementById("sidebarbtn")
	center = document.querySelector(".center")

	if leftbar.className
		leftbar.className = ""
		btn.innerHTML = "&larr;"
		center.className = "center"
	else
		leftbar.className = "shrink";
		btn.innerHTML = "&rarr;";
		center.className = "center full"

window.hideSidebar = (e) =>
	e.preventDefault()
	leftbar = document.getElementById("leftbar")
	btn = document.getElementById("sidebarbtn")
	center = document.querySelector(".center")

	if leftbar.className
		leftbar.className = ""
		btn.innerHTML = "&larr;"
		center.className = "center"
	else
		leftbar.className = "shrink"
		btn.innerHTML = "&rarr;"
		center.className = "center full"

window.setActiveTab = (tab) =>
	$('.tabtitle').addClass('deactivated')
	$('.tab').removeClass('visible')
	$('.tabtitle.'+tab).removeClass('deactivated')
	$('.tab.'+tab).addClass('visible')

window.ajax = (url, callback) =>
	xhr = new XMLHttpRequest()
	xhr.onload = () => callback(xhr.responseText)
	xhr.open("GET", url)
	xhr.send()

window.updateStorage = () =>
	ajax "/storage/#{window.__PLAY_ID}", (text) =>
		if not text then return

		json = JSON.parse(text)
		bucket = {}
		options = ""

		for child in json
			bucket[child.name] = 1

		for table of bucket
			options += "<option" + (currentSelectedTable == table ? " selected" : "") + ">" + table + "</option>";


		document.getElementById("tableselect").innerHTML = options;

		if not currentSelectedTable
			currentSelectedTable = json[0].name

		html = "<table><tr>";
		for key in json[0].data
			html += "<td>#{key}</td>"

		html += "</tr>";

		for child in json
			if child.name == currentSelectedTable
				html += "<tr>";
				for key in child.data
					html += "<td>#{key}</td>"
				html += "</tr>";


		html += "</table>";
		document.getElementById("storagetable").innerHTML = html;

window.init = () =>

	$('#sidebarbtn').click(hideSidebar);
	$(".tabtitle.qset").click () => setActiveTab("qset")
	$(".tabtitle.storage").click () => setActiveTab("storage")
	$('#tableselect').change () => currentSelectedTable = $('#tableselect').val()

	$("#btnReload").click () =>
		window._qset = JSON.parse(document.getElementById("qset").value)
		Materia.Player.init(API_LINK, window.__PLAY_ID, "container", BASE_URL)

	if window.location.href.lastIndexOf("/preview/") > -1
		$("#build-commands").css("display", "none")
		$("#switch").css("display", "none")

init();