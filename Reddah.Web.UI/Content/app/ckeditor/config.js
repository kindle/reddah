﻿/**
 * Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	config.removePlugins = 'image';
	config.extraPlugins = 'html5video';
	config.extraPlugins = 'image2';
	//config.extraPlugins = 'filebrowser';
	config.filebrowserImageUploadUrl = "/upload";
	//config.filebrowserBrowseUrl = "";
	//config.filebrowserUploadUrl = "";
	//config.filebrowserImageUploadMethod = "form";
};

