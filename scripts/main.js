/**
 * Main JavaScript
 * Way2CU - AES Encryption/Decryption
 *
 * Copyright (c) 2015. by Way2CU, http://way2cu.com
 * Authors: Mladen Mijatov
 */

var Page = Page || {};

/**
 * Encrypt message with provided password and replace content for textarea.
 */
Page.encrypt_message = function(event) {
	var password = Page.input_password.value;
	var message = Page.input_message.value;

	// encrypt message
	message = CryptoJS.AES.encrypt(message, password).toString();
	if (message.slice(-1) != '=')
		message = message + '=';

	// replace content
	Page.input_message.value = message;

	// dispatch event
	var event = document.createEvent('HTMLEvents');
	event.initEvent('input', true, true);
	event.eventName = 'input';

	Page.input_message.dispatchEvent(event);

	// select content for easier operation
	Page.input_message.select();
};

/**
 * Decrypt pasted message and replace content of textarea.
 */
Page.decrypt_message = function(event) {
	var password = Page.input_password.value;
	var message = Page.input_message.value;

	// decrypt message
	message = CryptoJS.AES.decrypt(message, password);

	// replace content
	Page.input_message.value = message.toString(CryptoJS.enc.Utf8);

	// dispatch event
	var event = document.createEvent('HTMLEvents');
	event.initEvent('input', true, true);
	event.eventName = 'input';

	Page.input_message.dispatchEvent(event);
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
	if (Page.input_message.value.slice(-1) == '=')
		Page.button_encrypt.disabled = true; else
		Page.button_decrypt.disabled = true;
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

	// connect events
	Page.button_encrypt.addEventListener('click', Page.encrypt_message, false);
	Page.button_decrypt.addEventListener('click', Page.decrypt_message, false);
	Page.input_message.addEventListener('input', Page.handle_message_change, false);
};

// add event listener for document load
window.addEventListener('load', Page.on_site_load, false);
