/**
 * Main JavaScript
 * Way2CU - AES Encryption/Decryption
 *
 * Copyright (c) 2016. by Way2CU, http://way2cu.com
 * Authors: Mladen Mijatov
 */

var Page = Page || {};

/**
 * Encrypt message with provided password and replace content for textarea.
 */
Page.encrypt_message = function(event) {
	var password = Page.input_password.value;
	var message = Page.input_message.value;

	// make sure encryption is supported
	if (!window.crypto || !window.crypto.subtle) {
		alert('Sorry, your browser doesn\'t provide support for cryptographic tools.');
		return;
	}

	// get objects after check
	var encoder = new TextEncoder('utf-8');
	var vector = crypto.getRandomValues(new Uint8Array(16));

	// create key hash
	crypto.subtle.digest({name: 'SHA-256'}, encoder.encode(password))
		.then(function(hash) {
			return crypto.subtle.importKey('raw', hash, {name: 'AES-CBC'}, false, ['encrypt']);
		})

		// encrypt message
		.then(function(key) {
			var data = encoder.encode(message);
			return crypto.subtle.encrypt({name: 'AES-CBC', iv: vector}, key, data);
		})

		// replace message text
		.then(function(data) {
			var text = String.fromCharCode.apply(null, new Uint8Array(data));
			var vector_text = String.fromCharCode.apply(null, vector);
			var text = btoa(vector_text + text);

			// make sure we have trailing equals sign
			if (text.slice(-1) != '=')
				text = text + '=';

			// replace content
			Page.input_message.value = text;

			// dispatch event
			var event = document.createEvent('HTMLEvents');
			event.initEvent('input', true, true);
			event.eventName = 'input';

			Page.input_message.dispatchEvent(event);

			// select content for easier operation
			Page.input_message.select();
		});
};

/**
 * Decrypt pasted message and replace content of textarea.
 */
Page.decrypt_message = function(event) {
	var password = Page.input_password.value;
	var message = Page.input_message.value.trim();

	// make sure message doesn't have equals sign
	message = message.replace(/\=+\s*$/, '');

	// make sure encryption is supported
	if (!window.crypto || !window.crypto.subtle) {
		alert('Sorry, your browser doesn\'t provide support for cryptographic tools.');
		return;
	}

	// get objects after check
	var encoder = new TextEncoder('utf-8');
	var decoder = new TextDecoder('utf-8');

	// create key hash
	crypto.subtle.digest({name: 'SHA-256'}, encoder.encode(password))
		.then(function(hash) {
			return crypto.subtle.importKey('raw', hash, {name: 'AES-CBC'}, false, ['decrypt']);
		})

		// encrypt message
		.then(function(key) {
			var raw_data = atob(message);
			var raw_vector = raw_data.substr(0, 16);
			var raw_message = raw_data.substr(16);

			var message_chars = Array.from(raw_message).map(function(c) { return c.charCodeAt(0) });
			var data = Uint8Array.from(message_chars);

			var vector_chars = Array.from(raw_vector).map(function(c) { return c.charCodeAt(0) });
			var vector = Uint8Array.from(vector_chars);

			return crypto.subtle.decrypt({name: 'AES-CBC', iv: vector}, key, data);
		})

		// replace message text
		.then(function(data) {
			var text = decoder.decode(new Uint8Array(data));

			// replace content
			Page.input_message.value = text;

			// dispatch event
			var event = document.createEvent('HTMLEvents');
			event.initEvent('input', true, true);
			event.eventName = 'input';

			Page.input_message.dispatchEvent(event);
		});
};

/**
 * Handle changing message text and enable buttons accordingly.
 * @param object event
 */
Page.handle_message_change = function(event) {
	Page.button_encrypt.disabled = false;
	Page.button_decrypt.disabled = false;

	// we require password
	if (Page.input_password == '')
		return;

	// check if message is encrypted or not
	if (Page.input_message.value.trim().slice(-1) == '=')
		Page.button_encrypt.disabled = true; else
		Page.button_decrypt.disabled = true;
};

/**
 * Handle changing option to show password as clear text.
 * @param object event
 */
Page.handle_show_password_change = function(event) {
	var show_password = event.target.checked;

	if (show_password)
		Page.input_password.type = 'text'; else
		Page.input_password.type = 'password';
};

/**
 * Handle site load event.
 * @param object event
 */
Page.on_site_load = function(event) {
	// get elements
	Page.input_password = document.getElementsByName('password')[0];
	Page.input_message = document.getElementsByName('message')[0];
	Page.button_encrypt = document.getElementsByName('encrypt')[0];
	Page.button_decrypt = document.getElementsByName('decrypt')[0];
	Page.show_password_checkbox = document.getElementsByName('show')[0];

	// connect events
	Page.button_encrypt.addEventListener('click', Page.encrypt_message, false);
	Page.button_decrypt.addEventListener('click', Page.decrypt_message, false);
	Page.input_message.addEventListener('input', Page.handle_message_change, false);
	Page.show_password_checkbox.addEventListener('change', Page.handle_show_password_change);
};

// add event listener for document load
window.addEventListener('load', Page.on_site_load, false);
