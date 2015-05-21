// Copyright 2012 William Malone (www.williammalone.com)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/*jslint browser: true */
/*global G_vmlCanvasManager */

var drawingApp = (function () {

	"use strict";

	var contexts = {},
		context,
		canvasWidth = 490,
		canvasHeight = 260,
		outlineImage = new Image(),
		crayonImage = new Image(),
		markerImage = new Image(),
		eraserImage = new Image(),
		crayonBackgroundImage = new Image(),
		markerBackgroundImage = new Image(),
		eraserBackgroundImage = new Image(),
		crayonTextureImage = new Image(),
		clickX = [],
		clickY = [],
		clickColor = [],
		clickTool = [],
		clickSize = [],
		clickDrag = [],
		paint = false,
		curTool = "marker",
		curSize = "large",
		mediumStartX = 18,
		mediumStartY = 19,
		mediumImageWidth = 93,
		mediumImageHeight = 46,
		drawingAreaX = 111,
		drawingAreaY = 11,
		drawingAreaWidth = 267,
		drawingAreaHeight = 239,
		toolHotspotStartY = 23,
		toolHotspotHeight = 38,
		sizeHotspotStartY = 200,
		sizeHotspotHeight = 36,
		sizeLineStartY = 228,
		totalLoadResources = 10,
		curLoadResNum = 0,
		sizeHotspotWidthObject = {
			huge: 39,
			large: 25,
			normal: 18,
			small: 16
		},

		swatchImage = new Image(),
		swatchImageWidth = 93,
		swatchImageHeight = 46,
		colorLayerData,
		outlineLayerData,
		bucketBackgroundImage = new Image(),
		colorPurple = {
			r: 203,
			g: 53,
			b: 148
		},
		colorGreen = {
			r: 101,
			g: 155,
			b: 65
		},
		colorYellow = {
			r: 255,
			g: 207,
			b: 51
		},
		colorBrown = {
			r: 152,
			g: 105,
			b: 40
		},
		curColor = colorGreen,

		// Draw a color swatch
		drawColorSwatch = function (color, x, y) {

			context.beginPath();
			context.arc(x + 46, y + 23, 18, 0, Math.PI * 2, true);
			context.closePath();
			context.fillStyle = "rgb(" + color.r + "," + color.g + "," + color.b + ")";
			context.fill();

			if (curColor === color) {
				context.drawImage(swatchImage, 0, 0, 59, swatchImageHeight, x, y, 59, swatchImageHeight);
			} else {
				context.drawImage(swatchImage, x, y, swatchImageWidth, swatchImageHeight);
			}
		},

		addClick = function (x, y, dragging) {

			clickX.push(x);
			clickY.push(y);
			clickTool.push(curTool);
			clickColor.push(curColor);
			clickSize.push(curSize);
			clickDrag.push(dragging);
		},

		clearClick = function () {

			clickX = [clickX[clickX.length - 1]];
			clickY = [clickY[clickY.length - 1]];
			clickTool = [clickTool[clickTool.length - 1]];
			clickColor = [clickColor[clickColor.length - 1]];
			clickSize = [clickSize[clickSize.length - 1]];
			clickDrag = [clickDrag[clickDrag.length - 1]];
		},

		// Redraws the canvas.
		redraw = function () {

			var locX,
				locY,
				radius,
				i,
				selected,

				drawCrayon = function (x, y, color, selected) {

					context.beginPath();
					context.moveTo(x + 41, y + 11);
					context.lineTo(x + 41, y + 35);
					context.lineTo(x + 29, y + 35);
					context.lineTo(x + 29, y + 33);
					context.lineTo(x + 11, y + 27);
					context.lineTo(x + 11, y + 19);
					context.lineTo(x + 29, y + 13);
					context.lineTo(x + 29, y + 11);
					context.lineTo(x + 41, y + 11);
					context.closePath();
					context.fillStyle = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
					context.fill();

					if (selected) {
						context.drawImage(crayonImage, x, y, mediumImageWidth, mediumImageHeight);
					} else {
						context.drawImage(crayonImage, 0, 0, 59, mediumImageHeight, x, y, 59, mediumImageHeight);
					}
				},

				drawMarker = function (x, y, color, selected) {

					context.beginPath();
					context.moveTo(x + 10, y + 24);
					context.lineTo(x + 10, y + 24);
					context.lineTo(x + 22, y + 16);
					context.lineTo(x + 22, y + 31);
					context.closePath();
					context.fillStyle = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
					context.fill();

					if (selected) {
						context.drawImage(markerImage, x, y, mediumImageWidth, mediumImageHeight);
					} else {
						context.drawImage(markerImage, 0, 0, 59, mediumImageHeight, x, y, 59, mediumImageHeight);
					}
				};

			// Make sure required resources are loaded before redrawing
			if (curLoadResNum < totalLoadResources) {
				return;
			}

			//clearCanvas();

			if (curTool === "crayon") {

				// Draw the crayon tool background
				context.drawImage(crayonBackgroundImage, 0, 0, canvasWidth, canvasHeight);

				// Draw purple crayon
				selected = (curColor === colorPurple);
				locX = selected ? 18 : 52;
				locY = 19;
				drawCrayon(locX, locY, colorPurple, selected);

				// Draw green crayon
				selected = (curColor === colorGreen);
				locX = selected ? 18 : 52;
				locY += 46;
				drawCrayon(locX, locY, colorGreen, selected);

				// Draw yellow crayon
				selected = (curColor === colorYellow);
				locX = selected ? 18 : 52;
				locY += 46;
				drawCrayon(locX, locY, colorYellow, selected);

				// Draw brown crayon
				selected = (curColor === colorBrown);
				locX = selected ? 18 : 52;
				locY += 46;
				drawCrayon(locX, locY, colorBrown, selected);

			} else if (curTool === "marker") {

				// Draw the marker tool background
				context.drawImage(markerBackgroundImage, 0, 0, canvasWidth, canvasHeight);

				// Draw purple marker
				selected = (curColor === colorPurple);
				locX = selected ? 18 : 52;
				locY = 19;
				drawMarker(locX, locY, colorPurple, selected);

				// Draw green marker
				selected = (curColor === colorGreen);
				locX = selected ? 18 : 52;
				locY += 46;
				drawMarker(locX, locY, colorGreen, selected);

				// Draw yellow marker
				selected = (curColor === colorYellow);
				locX = selected ? 18 : 52;
				locY += 46;
				drawMarker(locX, locY, colorYellow, selected);

				// Draw brown marker
				selected = (curColor === colorBrown);
				locX = selected ? 18 : 52;
				locY += 46;
				drawMarker(locX, locY, colorBrown, selected);

			} else if (curTool === "eraser") {

				context.drawImage(eraserBackgroundImage, 0, 0, canvasWidth, canvasHeight);
				context.drawImage(eraserImage, 18, 19, mediumImageWidth, mediumImageHeight);

			}

			if (curTool === "bucket") {

				// Draw the background
				context.drawImage(bucketBackgroundImage, 0, 0, canvasWidth, canvasHeight);

				// Draw the current state of the color layer to the canvas
				contexts.drawing.putImageData(colorLayerData, 0, 0, 0, 0, drawingAreaWidth, drawingAreaHeight);

				// Draw the color swatches
				locX = 52;
				locY = 19;
				drawColorSwatch(colorPurple, locX, locY);

				locY += 46;
				drawColorSwatch(colorGreen, locX, locY);

				locY += 46;
				drawColorSwatch(colorYellow, locX, locY);

				locY += 46;
				drawColorSwatch(colorBrown, locX, locY);

			} else {

				// Draw line on ruler to indicate size
				switch (curSize) {
				case "small":
					locX = 467;
					break;
				case "normal":
					locX = 450;
					break;
				case "large":
					locX = 428;
					break;
				case "huge":
					locX = 399;
					break;
				default:
					break;
				}
				locY = sizeLineStartY;
				context.beginPath();
				context.rect(locX, locY, 2, 12);
				context.closePath();
				context.fillStyle = '#333333';
				context.fill();

				if (clickX.length) {

					// For each point drawn
					for (i = 0; i < clickX.length; i += 1) {

						contexts.drawing.beginPath();

						// Set the drawing radius
						switch (clickSize[i]) {
						case "small":
							radius = 2;
							break;
						case "normal":
							radius = 5;
							break;
						case "large":
							radius = 10;
							break;
						case "huge":
							radius = 20;
							break;
						default:
							break;
						}

						// If dragging then draw a line between the two points
						if (clickDrag[i] && i) {
							contexts.drawing.moveTo(clickX[i - 1], clickY[i - 1]);
						} else {
							// The x position is moved over one pixel so a circle even if not dragging
							contexts.drawing.moveTo(clickX[i] - 1, clickY[i]);
						}
						contexts.drawing.lineTo(clickX[i], clickY[i]);

						// Set the drawing color
						if (curTool === "eraser") {
							contexts.drawing.strokeStyle = 'white';
						} else {
							contexts.drawing.strokeStyle = "rgb(" + clickColor[i].r + ", " + clickColor[i].g + ", " + clickColor[i].b + ")";
						}

						contexts.drawing.lineCap = "round";
						contexts.drawing.lineJoin = "round";
						contexts.drawing.lineWidth = radius;
						contexts.drawing.stroke();
						contexts.drawing.closePath();
					}

					clearClick();
				}
			}

			// Overlay a crayon texture (if the current tool is crayon)
			if (curTool === "crayon") {
				contexts.texture.canvas.style.display = "block";
			} else {
				contexts.texture.canvas.style.display = "none";
			}
		},

		matchOutlineColor = function (r, g, b, a) {

			return (r + g + b < 100 && a === 255);
		},

		matchStartColor = function (pixelPos, startR, startG, startB) {

			var r = outlineLayerData.data[pixelPos],
				g = outlineLayerData.data[pixelPos + 1],
				b = outlineLayerData.data[pixelPos + 2],
				a = outlineLayerData.data[pixelPos + 3];

			// If current pixel of the outline image is black
			if (matchOutlineColor(r, g, b, a)) {
				return false;
			}

			r = colorLayerData.data[pixelPos];
			g = colorLayerData.data[pixelPos + 1];
			b = colorLayerData.data[pixelPos + 2];

			// If the current pixel matches the clicked color
			if (r === startR && g === startG && b === startB) {
				return true;
			}

			// If current pixel matches the new color
			if (r === curColor.r && g === curColor.g && b === curColor.b) {
				return false;
			}

			// Return the difference in current color and start color within a tolerance
			return (Math.abs(r - startR) + Math.abs(g - startG) + Math.abs(b - startB) < 255);
		},

		colorPixel = function (pixelPos, r, g, b, a) {

			colorLayerData.data[pixelPos] = r;
			colorLayerData.data[pixelPos + 1] = g;
			colorLayerData.data[pixelPos + 2] = b;
			colorLayerData.data[pixelPos + 3] = a !== undefined ? a : 255;
		},

		floodFill = function (startX, startY, startR, startG, startB) {

			var newPos,
				x,
				y,
				pixelPos,
				reachLeft,
				reachRight,
				drawingBoundLeft = 0,
				drawingBoundTop = 0,
				drawingBoundRight = drawingAreaWidth - 1,
				drawingBoundBottom = drawingAreaHeight - 1,
				pixelStack = [[startX, startY]];

			while (pixelStack.length) {

				newPos = pixelStack.pop();
				x = newPos[0];
				y = newPos[1];

				// Get current pixel position
				pixelPos = (y * drawingAreaWidth + x) * 4;

				// Go up as long as the color matches and are inside the canvas
				while (y >= drawingBoundTop && matchStartColor(pixelPos, startR, startG, startB)) {
					y -= 1;
					pixelPos -= drawingAreaWidth * 4;
				}

				pixelPos += drawingAreaWidth * 4;
				y += 1;
				reachLeft = false;
				reachRight = false;

				// Go down as long as the color matches and in inside the canvas
				while (y <= drawingBoundBottom && matchStartColor(pixelPos, startR, startG, startB)) {
					y += 1;

					colorPixel(pixelPos, curColor.r, curColor.g, curColor.b);

					if (x > drawingBoundLeft) {
						if (matchStartColor(pixelPos - 4, startR, startG, startB)) {
							if (!reachLeft) {
								// Add pixel to stack
								pixelStack.push([x - 1, y]);
								reachLeft = true;
							}
						} else if (reachLeft) {
							reachLeft = false;
						}
					}

					if (x < drawingBoundRight) {
						if (matchStartColor(pixelPos + 4, startR, startG, startB)) {
							if (!reachRight) {
								// Add pixel to stack
								pixelStack.push([x + 1, y]);
								reachRight = true;
							}
						} else if (reachRight) {
							reachRight = false;
						}
					}

					pixelPos += drawingAreaWidth * 4;
				}
			}
		},

		// Start painting with paint bucket tool starting from pixel specified by startX and startY
		paintAt = function (startX, startY) {

			var pixelPos = (startY * drawingAreaWidth + startX) * 4,
				r = colorLayerData.data[pixelPos],
				g = colorLayerData.data[pixelPos + 1],
				b = colorLayerData.data[pixelPos + 2],
				a = colorLayerData.data[pixelPos + 3];

			if (r === curColor.r && g === curColor.g && b === curColor.b) {
				// Return because trying to fill with the same color
				return;
			}

			if (matchOutlineColor(r, g, b, a)) {
				// Return because clicked outline
				return;
			}

			floodFill(startX, startY, r, g, b);

			redraw();
		},

		// Add mouse and touch event listeners to the canvas
		createUserEvents = function () {

			var press = function (e) {

				// Mouse down location
				var sizeHotspotStartX,
					mouseX = e.pageX - this.offsetLeft,
					mouseY = e.pageY - this.offsetTop;

				if (mouseX < drawingAreaX) { // Left of the drawing area
					if (mouseX > mediumStartX) {
						if (mouseY > mediumStartY && mouseY < mediumStartY + mediumImageHeight) {
							curColor = colorPurple;
						} else if (mouseY > mediumStartY + mediumImageHeight && mouseY < mediumStartY + mediumImageHeight * 2) {
							curColor = colorGreen;
						} else if (mouseY > mediumStartY + mediumImageHeight * 2 && mouseY < mediumStartY + mediumImageHeight * 3) {
							curColor = colorYellow;
						} else if (mouseY > mediumStartY + mediumImageHeight * 3 && mouseY < mediumStartY + mediumImageHeight * 4) {
							curColor = colorBrown;
						}
					}
				} else if (mouseX > drawingAreaX + drawingAreaWidth) { // Right of the drawing area

					if (mouseY > toolHotspotStartY) {
						if (mouseY > sizeHotspotStartY) {
							sizeHotspotStartX = drawingAreaX + drawingAreaWidth;
							if (mouseY < sizeHotspotStartY + sizeHotspotHeight && mouseX > sizeHotspotStartX) {
								if (mouseX < sizeHotspotStartX + sizeHotspotWidthObject.huge) {
									curSize = "huge";
								} else if (mouseX < sizeHotspotStartX + sizeHotspotWidthObject.large + sizeHotspotWidthObject.huge) {
									curSize = "large";
								} else if (mouseX < sizeHotspotStartX + sizeHotspotWidthObject.normal + sizeHotspotWidthObject.large + sizeHotspotWidthObject.huge) {
									curSize = "normal";
								} else if (mouseX < sizeHotspotStartX + sizeHotspotWidthObject.small + sizeHotspotWidthObject.normal + sizeHotspotWidthObject.large + sizeHotspotWidthObject.huge) {
									curSize = "small";
								}
							}
						} else {
							if (mouseY < toolHotspotStartY + toolHotspotHeight) {
								curTool = "crayon";
							} else if (mouseY < toolHotspotStartY + toolHotspotHeight * 2) {
								curTool = "marker";
							} else if (mouseY < toolHotspotStartY + toolHotspotHeight * 3) {
								curTool = "eraser";
							} else if (mouseY < toolHotspotStartY + toolHotspotHeight * 4) {

								if (curTool !== "bucket") {
									curTool = "bucket";
									colorLayerData = contexts.drawing.getImageData(0, 0, drawingAreaWidth, drawingAreaHeight);
								}
							}
						}
					}
				}
			},

				drag = function (e) {

					if (curTool !== "bucket") {
						if (paint) {
							addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
							redraw();
						}
					}
					// Prevent the whole page from dragging if on mobile
					e.preventDefault();
				},

				release = function () {

					if (curTool !== "bucket") {
						paint = false;
					}
					redraw();
				},

				cancel = function () {
					if (curTool !== "bucket") {
						paint = false;
					}
				},

				pressDrawing = function (e) {

					// Mouse down location
					var mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - this.offsetLeft,
						mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - this.offsetTop;

					if (curTool === "bucket") {
						// Mouse click location on drawing area
						paintAt(mouseX, mouseY);
					} else {
						paint = true;
						addClick(mouseX, mouseY, false);
					}

					redraw();
				},

				dragDrawing = function (e) {
					
					var mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - this.offsetLeft,
						mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - this.offsetTop;

					if (curTool !== "bucket") {
						if (paint) {
							addClick(mouseX, mouseY, true);
							redraw();
						}
					}

					// Prevent the whole page from dragging if on mobile
					e.preventDefault();
				},

				releaseDrawing = function () {

					if (curTool !== "bucket") {
						paint = false;
						redraw();
					}
				},

				cancelDrawing = function () {
					if (curTool === "bucket") {
						paint = false;
					}
				};

			// Add mouse event listeners to canvas element
			context.canvas.addEventListener("mousedown", press, false);
			context.canvas.addEventListener("mousemove", drag, false);
			context.canvas.addEventListener("mouseup", release);
			context.canvas.addEventListener("mouseout", cancel, false);

			// Add touch event listeners to canvas element
			context.canvas.addEventListener("touchstart", press, false);
			context.canvas.addEventListener("touchmove", drag, false);
			context.canvas.addEventListener("touchend", release, false);
			context.canvas.addEventListener("touchcancel", cancel, false);

			// Add mouse event listeners to canvas element
			contexts.outline.canvas.addEventListener("mousedown", pressDrawing, false);
			contexts.outline.canvas.addEventListener("mousemove", dragDrawing, false);
			contexts.outline.canvas.addEventListener("mouseup", releaseDrawing);
			contexts.outline.canvas.addEventListener("mouseout", cancelDrawing, false);

			// Add touch event listeners to canvas element
			contexts.outline.canvas.addEventListener("touchstart", pressDrawing, false);
			contexts.outline.canvas.addEventListener("touchmove", dragDrawing, false);
			contexts.outline.canvas.addEventListener("touchend", releaseDrawing, false);
			contexts.outline.canvas.addEventListener("touchcancel", cancelDrawing, false);
		},

		// Calls the redraw function after all neccessary resources are loaded.
		resourceLoaded = function () {

			curLoadResNum += 1;
			if (curLoadResNum === totalLoadResources) {
				redraw();
				createUserEvents();
			}
		},

		// Creates a canvas element, loads images, adds events, and draws the canvas for the first time.
		init = function (width, height) {

			var canvasElement;

			if (width && height) {
				canvasWidth = width;
				canvasHeight = height;
			}

			// Create the canvas (Neccessary for IE because it doesn't know what a canvas element is)
			canvasElement = document.createElement('canvas');
			canvasElement.setAttribute('width', canvasWidth);
			canvasElement.setAttribute('height', canvasHeight);
			canvasElement.setAttribute('id', 'gui');
			document.getElementById('canvasDiv').appendChild(canvasElement);
			if (typeof G_vmlCanvasManager !== "undefined") {
				canvasElement = G_vmlCanvasManager.initElement(canvasElement);
			}
			context = canvasElement.getContext("2d"); // Grab the 2d canvas context
			// Note: The above code is a workaround for IE 8 and lower. Otherwise we could have used:
			//     context = document.getElementById('canvas').getContext("2d");

			canvasElement = document.createElement('canvas');
			canvasElement.setAttribute('width', drawingAreaWidth);
			canvasElement.setAttribute('height', drawingAreaHeight);
			canvasElement.setAttribute('id', 'drawing');
			canvasElement.style.marginLeft = drawingAreaX + "px";
			canvasElement.style.marginTop = drawingAreaY + "px";
			document.getElementById('canvasDiv').appendChild(canvasElement);
			if (typeof G_vmlCanvasManager !== "undefined") {
				canvasElement = G_vmlCanvasManager.initElement(canvasElement);
			}
			contexts.drawing = canvasElement.getContext("2d"); // Grab the 2d canvas context

			canvasElement = document.createElement('canvas');
			canvasElement.setAttribute('width', drawingAreaWidth);
			canvasElement.setAttribute('height', drawingAreaHeight);
			canvasElement.setAttribute('id', 'outline');
			canvasElement.style.marginLeft = drawingAreaX + "px";
			canvasElement.style.marginTop = drawingAreaY + "px";
			document.getElementById('canvasDiv').appendChild(canvasElement);
			if (typeof G_vmlCanvasManager !== "undefined") {
				canvasElement = G_vmlCanvasManager.initElement(canvasElement);
			}
			contexts.texture = canvasElement.getContext("2d"); // Grab the 2d canvas context

			canvasElement = document.createElement('canvas');
			canvasElement.setAttribute('width', drawingAreaWidth);
			canvasElement.setAttribute('height', drawingAreaHeight);
			canvasElement.setAttribute('id', 'outline');
			canvasElement.style.marginLeft = drawingAreaX + "px";
			canvasElement.style.marginTop = drawingAreaY + "px";
			document.getElementById('canvasDiv').appendChild(canvasElement);
			if (typeof G_vmlCanvasManager !== "undefined") {
				canvasElement = G_vmlCanvasManager.initElement(canvasElement);
			}
			contexts.outline = canvasElement.getContext("2d"); // Grab the 2d canvas context

			// Load images
			crayonImage.onload = resourceLoaded;
			crayonImage.src = "images/crayon-outline.png";

			markerImage.onload = resourceLoaded;
			markerImage.src = "images/marker-outline.png";

			eraserImage.onload = resourceLoaded;
			eraserImage.src = "images/eraser-outline.png";

			crayonBackgroundImage.onload = resourceLoaded;
			crayonBackgroundImage.src = "images/crayon-background.png";

			markerBackgroundImage.onload = resourceLoaded;
			markerBackgroundImage.src = "images/marker-background.png";

			eraserBackgroundImage.onload = resourceLoaded;
			eraserBackgroundImage.src = "images/eraser-background.png";

			bucketBackgroundImage.onload = resourceLoaded;
			bucketBackgroundImage.src = "images/bucket-background.png";

			crayonTextureImage.onload = function () {
				contexts.texture.drawImage(crayonTextureImage, 0, 0, drawingAreaWidth, drawingAreaHeight);
				resourceLoaded();
			};
			crayonTextureImage.src = "images/crayon-texture.png";

			swatchImage.onload = resourceLoaded;
			swatchImage.src = "images/paint-outline.png";

			outlineImage.onload = function () {

				contexts.outline.drawImage(outlineImage, 0, 0, drawingAreaWidth, drawingAreaHeight);
				// Test for cross origin security error (SECURITY_ERR: DOM Exception 18)
				try {
					outlineLayerData = contexts.outline.getImageData(0, 0, drawingAreaWidth, drawingAreaHeight);
					colorLayerData = contexts.drawing.getImageData(0, 0, drawingAreaWidth, drawingAreaHeight);
				} catch (ex) {
					//window.alert("Application cannot be run locally. Please run on a server.");
					//return;
				}

				resourceLoaded();
			};
			outlineImage.src = "images/watermelon-duck-outline.png";
		};

	return {
		init: init
	};
}());