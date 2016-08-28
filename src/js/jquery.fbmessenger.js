/*!
 * jQuery.fbMessenger
 * Simulates interaction with a Facebook Messenger bot on an iPhone
 *
 * Version: 0.0.4
 * Author: Matthias Gall <matthias.gall@digitalbreed.com>
 * Copyright (c) by Matthias Gall 2016, all rights reserved.
 *
 * https://github.com/digitalbreed/jquery.fbmessenger
 */
(function($) {

	var DATA_ATTRIBUTE = 'jquery.fbmessenger';
	var DEFAULTS = {
		botLogoUrl: 'botlogo.png',
		botName: 'jQuery.fbMessenger',
		botCategory: 'Software',
		botWelcomeMessage: 'jQuery.fbMessenger is a plugin to simulate interaction with a Facebook Messenger bot on an iPhone.',
		leftUser: 'bot',
		rightUser: 'user',
		displayedCarrier: 'o2-de',
		displayedTime: '22:00',
		scrollTimeMs: 500,
		loop: true,
		dateFormat: function(date) {
			var pad = function(val) {
				var str = '' + val;
				if (str.length < 2) {
					str = '00' + str;
				}
				return str.substring(str.length - 2);
			}
			var month = ['JAN.', 'FEB.', 'MAR.', 'APR.', 'MAY', 'JUN.', 'JUL.', 'AUG.', 'SEP.', 'OCT.', 'NOV.', 'DEC.'];
			return date.getDate() + '. ' + month[date.getMonth()] + ', ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
		},
		script: [],
		state: {
			welcomeMessageDisplayed: true,
			lastTimestamp: null,
			quickRepliesDisplayed: false
		}
	};

	function Plugin(element, options) {
		this.element = element;
		this.$element = $(element);
		this.options = $.extend(true, {}, DEFAULTS, options);
		this.init();
	}

	Plugin.prototype.init = function() {
		this.$element.append('\
			<div class="jsm-iphone-content">\
				<div class="jsm-status-navbar">\
					<div class="jsm-status-bar">\
						<div class="jsm-carrier">\
							<span class="jsm-carrier-ring closed"></span>\
							<span class="jsm-carrier-ring closed"></span>\
							<span class="jsm-carrier-ring closed"></span>\
							<span class="jsm-carrier-ring open"></span>\
							<span class="jsm-carrier-ring open"></span>\
							<span class="jsm-carrier-name">' + this.options.displayedCarrier + '</span>\
						</div>\
						<div class="jsm-battery">\
							<span class="jsm-battery-percent">51 %</span>\
							<img class="jsm-battery-image"  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAATCAYAAAA5+OUhAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AgTFgId4dfTCwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAw0lEQVRIx93XsQ5BMRgF4I/IvYPEC1hNJoPXMJokFgZvYrZ4CV7AC5hYSDyGRQwkwtKBy3hvoj3JSZr/b9pz2qbtDxnG2OP5x9wHnVmRDQwxwwQn/4sulnhgVUweQod5BauXlcxu0PsRr4XJclxCsEzkFezIrThu/a2diRR1CSBmE2es0W5EbKKJAVopHKd+CiaaKZi4pmBiF7uJDaYx3055so/dPWYTR3SwiEBvJ+j9wghb9Cr4OpfJXtA5+pGLv7J7ATA1fYuDT5NBAAAAAElFTkSuQmCC">\
						</div>\
						<div class="jsm-clock">' + this.options.displayedTime + '</div>\
					</div>\
					<div class="jsm-nav-left">\
						<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAqCAYAAACtMEtjAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AgVFDEPwOpMwQAAAtBJREFUWMO110tIFVEcx/HvmTshZqa9EAXLUnxcymcJarnxUWlYWS5qES56QC3LIBxbOHeTrYMeiyJoIWUZlkkq9jAixdf1qmgS9EJCBKM2wdw7LUTSdObqzNyzPDOXz/0ffufM+UMohqq1owbeLZySQoB0IVzFCJGPqr2enxaOIvWBbiRRsGhO93dQJ5c4B3kCH0DkLvtM97e6HEL6QOw2fC7EL+EAMgQi3fgFvR9FyrEehqSkMDyBkSDIAIqUYz11eVXhVE94QbiDINnWU5dXFU554zCIRBNkEEXKsr6PSi9FUN44ulpkdRVVXIskt2YERLwJMoQiZS4bvBUhVbeiyDwzii7irCArg04+2ID7xBiIGKtIcOjU400kHxkDscUE8aJIGcH+rzF0uiOGhCIfsNkuYgydfRPL1n0+YKMJMowipa80S0uh8z3xxO3xAtFOIUuhC/3biM3yAuudRBZDNcOJRO8cQCfSBPGhSLusnFpz0JWxZNal9qMTEQoEQObiRzcRSb3orA0VMnfWhQkJEWQ/BQLjdj9bc8DlTylEbe8zXbqAv4mr8nHrFQE07Bhn1pcB/DZ+03UMVWuyV9Gq4u1/giJXWqtoftzI/sy3925g1vgnrqN4tGZ7EMDN/O98eetGMGOCHUbVntqDAG4XTjH5Ig30aeNFd1Wgai32IIC7ZdNMNKeB/sMEO4RHe2YPArhfOcPQnRTQp0yWsRxVe24PAnh47ic911NA/2pSWRkerdX6F/b/G1Bhgw9EgvFJ5W+jTj5oD/p3p/OCSDLBXlIn77cHzV+FqycGQaSabOp2FLnUXiM2OfmHe8mZoPtMAlKCqrXbq2hpu5JtUlknilxsv7VUpBzQe0wqK0LVOp1rLVWtG+EqMAnIK2ea5Tp5L/i7jCFpjbPNskdrA9fiaAu9l1op19n2X5EPgL9lUTNWK+USslGvPcIT8C6c+gtjuOq4cXN0IAAAAABJRU5ErkJggg==">\
						Home\
					</div>\
					<div class="jsm-nav-title">\
						<div class="jsm-nav-title-bot-name">' + this.options.botName + '</div>\
						<div class="jsm-nav-title-replies-in">Typically replies in minutes</div>\
					</div>\
					<div class="jsm-nav-right">\
						Manage\
					</div>\
				</div>\
				<div class="jsm-chat-content">\
					<div class="jsm-bot-welcome-message">\
						<p>' + this.options.botWelcomeMessage + '</p>\
					</div>\
					<div class="jsm-bot-info">\
						<img src="' + this.options.botLogoUrl + '">\
						<div class="jsm-bot-info-name">' + this.options.botName + '</div>\
						<div class="jsm-bot-info-likes">25k people like this</div>\
						<div class="jsm-bot-info-category">' + this.options.botCategory + '</div>\
					</div>\
				</div>\
				<div class="jsm-bottom-bar">\
					<div class="jsm-quick-replies jsm-hide">\
						<div class="jsm-quick-replies-container">\
						</div>\
					</div>\
					<div class="jsm-get-started-button">\
						Get started\
					</div>\
					<div class="jsm-input-message jsm-hide">\
						<img class="jsm-persistent-menu" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAaCAYAAADbhS54AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AgUFCEdwS1IvQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAARklEQVRIx+3VQQ0AIBADwZagDl0gCewVEzwuZKtg0s9aM1vSUK2dpoqz4iQlbTUfAwYMGLAPYN1LtJJWAgMGDBgwWvmulRdvjBDe+GiHkQAAAABJRU5ErkJggg==">\
						Type a message&hellip;\
					</div>\
				</div>\
			</div>\
		');

		// Detect iOS devices
		var agent = navigator.userAgent;
		if (agent.indexOf('iPhone') > 0 || agent.indexOf('iPod') > 0) {
			this.$element.find('.jsm-chat-content').addClass('ios');
		}

		// Safari doesn't provide width immediately, but height
		// TODO recalculate on resize
		var width = this.$element.height() * 0.5622;
		var fontSize = Math.floor(width / 750 * 24);
		this.$element.css('font-size', fontSize + 'px');
	}

	Plugin.prototype.start = function(options) {
		if (options === undefined || options.delay === undefined) {
			if (this.options.state.welcomeMessageDisplayed) {
				this.$element.find('.jsm-bot-welcome-message,.jsm-get-started-button').addClass('jsm-hide');
				this.$element.find('.jsm-input-message').removeClass('jsm-hide');
				this.options.state.welcomeMessageDisplayed = false;
			}
		} else {
			this.options.script.push({
				method: 'start',
				args: [],
				delay: options.delay
			})
		}
		return this;
	}

	Plugin.prototype._checkWelcomeMessage = function() {
		if (this.options.state.welcomeMessageDisplayed) {
			$.error('Must call start before sending messages');
		}
	}

	Plugin.prototype._checkUser = function(user) {
		if (!user in [this.options.leftUser, this.options.rightUser]) {
			$.error('Unknown user ' + user);
		}
	}

	Plugin.prototype._checkQuickReply = function(expected) {
		if (expected === true && !this.options.state.quickRepliesDisplayed) {
			$.error('Quick replies are currently not displayed');
		} else if (expected === false && this.options.state.quickRepliesDisplayed) {
			$.error('Quick replies are already displayed');
		}
	}

	Plugin.prototype._scrollDown = function() {
		var scrollHeight = this.$element.find('.jsm-chat-content').prop('scrollHeight');
		this.$element.find('.jsm-chat-content').animate({
			scrollTop: scrollHeight
		}, this.options.scrollTimeMs);
	}

	Plugin.prototype._clearOptions = function(options) {
		var result = $.extend({}, options);
		delete result.delay;
		return result;
	}

	Plugin.prototype._addNewContent = function(user, $payload, timestamp) {
		var $content = this.$element.find('.jsm-chat-content');
		$content.find('.jsm-chat-row:has(.jsm-typing-indicator)').remove(); // FIXME don't remove if message is by right user!
		// Create a user-specific wrapper and create/get the user icon in case of left side
		var $user = $content.find('.jsm-user-wrapper:last');
		var $icon = null;
		var newWrapper = $user.length === 0 || !$user.hasClass(user);
		if (newWrapper) {
			$user = $('<div class="jsm-user-wrapper ' + user + '"></div>');
			if (user === this.options.leftUser) {
				$icon = $('<div class="jsm-user-icon"><img class="jsm-bot-logo" src="' + this.options.botLogoUrl + '"><img class="jsm-messenger-flash" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AgVDxUiZK69gwAABCVJREFUSMe1lltMHFUYx3/nzO6yS6EkwjZRpAv2ZYWXxoTYqDWA9cH2ASOmiDbwoFEbE31ppBAN6YPWmupbo6SJCTTFktaKNraJF2g0IjZpi0ZWSiRlsaGGBQJ2ge1eZnw4DLuzVy71n0wy55sz/3++75zvIoKhIMmYWprn5NhlNClwfjuI07WFKu9OKh7yahUlD3hcxduahRAtAIaudwXnAt13bo75p33DscC1X/hiRxlBp5NXnqynxvsI6SDSCQ/P+fn67+u4pYvGUKEs3VXbKm22I4Cd7IiEo5GOgdGrxy7+Pqi/13CQgjxX+p3BUNDyLIYWOfvXIJcmrxOORVqNDSISi7YZhkGmJ8VjKSTT4UXNU1CynOjhxAL0+qB/AnwBCCwpuzsfKt1QVw6NlVBeZI0A4AJiOUPtcricUshlc+1fgLYBJaob2eMshRL/oA62b7XSAiGr8N1FMBSj0+7UNKlFzY89I/DaRQiGWRcKHNC5F16ssphtiZ7L4MwcAHbNjia1VU8//hUO9K1fFNQ/B/rg+JDFHLVER4/GEELgsDlazTPtGYFD34PBxmEAb/+guBLQthrqKf8E7tJSadNsMYDJf6Gqc2OeZgr7H6+CJ37pNECXUpPYNFuraT3cf+9EzbC3DVhM7QBifnaGovuKw4B9YgF2nMh9e9cLKWD8DUuqCenMz9fMs11LygA8WJh7jybAZVPvugFnrGetSUee02Ou+idyE75VDaMHYU9F5j27y+DNaggl3OMBv2WLRwohms2VL5Bd9HkvfPQ0bLHDN43Q4LV+Ly2E089C++Nw4qo1K5K4myXQYq7MMpjJi1P1KoQADg16n4OXd0KeBocfg9HXwVsM+89DOKlITlu5W2zJuZcOlSXw1X5w2uDnW1B9vxLWBJzcBx27oWwr3JyHfb1wZw1ZIQ1d7zIX2/JTN5QWwqUmmA9Bwzl4ogueORMnFyjRmSVl/yeYXiiJu0sGA7e7Vz1zWzcX5cG5BvhsWBWV8zfil3DP6fjRLEWg/izcmM3sYRJ3t5wd/3P1vtWVx784NFXkX/gSjvwEy1Er0ZUpqDmlutdLfTB4K3toazyWpV/e/m0ottI3aaxUyQ6qYX1yTRFngm8GHv4U+sZyF5Ama6eKyckrPxK9G+oAVVkaK1c6uL62qpQciXRIGhDeBZCRpSDjAxeOmdajtaqw3ysUOBRnAt4HkAC+Cz26Ho20g+oinXvVbd0sBIrLY/VWBxBj3/Wx/dEa8gqLAMJm3T4+pPqpsQnRD5+CQ7tSzOrFMCzUWuKk8H+OPsnCAE5gU8Pe0VpLeNMPe2mEUzw3x9vPR+CyH0aSxtsqt8rTpqqU8TbF03h9zjJ0G4bRZmwc72TjziWMYRhyhWQ9gjIXb6ZQZxwsAA/QnNBOu4BuwJ82pBnwH0NDmSsr0rnYAAAAAElFTkSuQmCC"></div>');
				$user.append($icon);
			}
			$content.append($user);
		} else if ($user.hasClass(this.options.leftUser)) {
			$icon = $user.find('.jsm-user-icon');
		}
		$wrapper = $('<div class="jsm-chat-row"></div>');
		// Check if a new timestamp has to be inserted
		if (timestamp !== false) {
			var ts = this.options.dateFormat(timestamp ? timestamp : new Date());
			if (ts !== this.options.state.lastTimestamp) {
				$wrapper.append('<div class="jsm-chat-timestamp">' + ts + '</div>');
				this.options.state.lastTimestamp = ts;
			}
		}
		// Insert the actual content
		$wrapper.append($payload);
		// Now throw the whole row into the user-wrapper
		$user.append($wrapper);
		// If the icon needs to be maintained, position it correctly or animate it down to the newest message
		if ($icon) {
			var fontSize = parseInt($(this.element).css('font-size'));
			setTimeout(function() {
				var top = $user.height() - 3.5 * fontSize; // 3.5 = image size 3 + 0.5 margin bottom
				if (newWrapper) {
					$icon.css('top', top + 'px');
				} else {
					$icon.animate({
						top: top
					}, 250);
				}
			}, 1);
		}
		// Setup corners
		var $messages = $user.find('.jsm-chat-message');
		$messages.each(function(index) {
			if (index > 0) {
				$(this).addClass('has-previous');
			}
			if (index < $messages.length - 1) {
				$(this).addClass('has-next');
			}
		});
		// Scroll the entire view down
		this._scrollDown();
	}

	Plugin.prototype.message = function(user, text, options) {
		if (options === undefined || options.delay === undefined) {
			this._checkWelcomeMessage();
			this._checkUser(user);
			var sideClass = user === this.options.leftUser ? 'left' : user === this.options.rightUser ? 'right' : '';
			this._addNewContent(user, $('<div class="jsm-chat-message ' + sideClass + ' ' + (options.className || '') + '">' + text + '</div>'), options.timestamp);
		} else {
			this.options.script.push({
				method: 'message',
				args: [ user, text, this._clearOptions(options) ],
				delay: options.delay
			});
		}
		return this;
	}

	Plugin.prototype.typingIndicator = function(options) {
		if (options === undefined || options.delay === undefined) {
			this._checkWelcomeMessage();
			this._addNewContent(this.options.leftUser, $('<div class="jsm-chat-message left jsm-typing-indicator"><span></span><span></span><span></span></div>'), false);
		} else {
			this.options.script.push({
				method: 'typingIndicator',
				args: [],
				delay: options.delay
			});
		}
		return this;
	}

	Plugin.prototype.showQuickReplies = function(quickReplies, options) {
		if (options === undefined || options.delay === undefined) {
			this._checkWelcomeMessage();
			this._checkQuickReply(false);
			var $element = this.$element;
			// Create quick reply options
			var $quickReplies = $element.find('.jsm-quick-replies-container').empty();
			$.each(quickReplies, function(index, quickReply) {
				$quickReplies.append('<div class="jsm-quick-reply-option" style="transition-delay: ' + (index * 0.1).toFixed(1) + 's">' + quickReply + '</div>');
			});
			$element.find('.jsm-quick-replies').removeClass('jsm-hide');
			// Trigger transition to let the options appear
			var that = this;
			setTimeout(function() {
				that._scrollDown();
				// must be deferred to trigger proper transition
				$element.find('.jsm-quick-reply-option').addClass('show');
			}, 10);
			this.options.state.quickRepliesDisplayed = true;
		} else {
			this.options.script.push({
				method: 'showQuickReplies',
				args: [ quickReplies, this._clearOptions(options) ],
				delay: options.delay
			})
		}
		return this;
	}

	Plugin.prototype.scrollQuickReplies = function(quickReplyIndex, options) {
		if (options === undefined || options.delay === undefined) {
			this._checkWelcomeMessage();
			this._checkQuickReply(true);
			var $scroller = this.$element.find('.jsm-quick-replies');
			var $container = $scroller.find('.jsm-quick-replies-container');
			var $option = this.$element.find('.jsm-quick-reply-option:nth-child(' + (quickReplyIndex + 1) + ')');
			var optionPosX = $option.position().left;
			var target = -1;
			// Scroll only if quick reply is out of sight
			if (optionPosX > $scroller.width()) {
				target = $scroller.width() - $option.outerWidth();
			} else if (optionPosX < 0) {
				var padding = ($container.outerWidth() - $container.width()) / 2;
				target = $scroller.prop('scrollLeft') + optionPosX - padding;
			}
			if (target > -1) {
				var delta = Math.abs($scroller.prop('scrollLeft') - target) * 2;
				$scroller.animate({
					scrollLeft: target
				}, delta);
			}
		} else {
			this.options.script.push({
				method: 'scrollQuickReplies',
				args: [ quickReplyIndex, this._clearOptions(options) ],
				delay: options.delay
			})
		}
	}

	Plugin.prototype.selectQuickReply = function(quickReplyIndex, options) {
		if (options === undefined || options.delay === undefined) {
			this._checkWelcomeMessage();
			this._checkQuickReply(true);
			var $element = this.$element;
			var that = this;
			var $option = $element.find('.jsm-quick-reply-option:nth-child(' + (quickReplyIndex + 1) + ')').addClass('selected');
			setTimeout(function() {
				$element.find('.jsm-quick-reply-option').removeClass('show');
				setTimeout(function() {
					that.message(that.options.rightUser, $option.text(), { timestamp: false, className: 'quickreply' });
					var $message = $element.find('.jsm-chat-message:last');
					setTimeout(function() {
						$message.removeClass('quickreply');
					}, 100);
				}, 100);
			}, 500);
			// Hide quick reply options
			setTimeout(function() {
				$element.find('.jsm-quick-replies').animate({
					height: 0
				}, function() {
					that.options.state.quickRepliesDisplayed = false;
					$(this).addClass('jsm-hide').css('height', '');
				});
			}, 500 + 100 + 100);
		} else {
			this.options.script.push({
				method: 'selectQuickReply',
				args: [ quickReplyIndex, this._clearOptions(options) ],
				delay: options.delay
			});
		}
		return this;
	}

	Plugin.prototype.showButtonTemplate = function(text, buttons, options) {
		if (options === undefined || options.delay === undefined) {
			this._checkWelcomeMessage();
			this._checkQuickReply(false);
			var template = '<div class="jsm-chat-message left jsm-button-template"><div class="header">' + text + '</div>';
			$.each(buttons, function(index, button) {
				template += '<div class="button">' + button + '</div>';
			});
			template += '</div>';
			this._addNewContent(this.options.leftUser, $(template), options.timestamp);
		} else {
			this.options.script.push({
				method: 'showButtonTemplate',
				args: [ text, buttons, this._clearOptions(options) ],
				delay: options.delay
			});
		}
	}

	Plugin.prototype.selectButtonTemplate = function(buttonIndex, options) {
		if (options === undefined || options.delay === undefined) {
			this._checkWelcomeMessage();
			this._checkQuickReply(false);
			var $button = this.$element.find('.jsm-chat-content .jsm-button-template:last .button:nth-child(' + (buttonIndex + 1) + ')').addClass('selected');
			setTimeout(function() {
				$button.removeClass('selected');
			}, 1500);
			this.message(this.options.rightUser, $button.text(), { timestamp: false });
		} else {
			this.options.script.push({
				method: 'selectButtonTemplate',
				args: [ buttonIndex, this._clearOptions(options) ],
				delay: options.delay
			});
		}
	}

	Plugin.prototype.showGenericTemplate = function(items, options) {
		if (options === undefined || options.delay === undefined) {
			this._checkWelcomeMessage();
			this._checkQuickReply(false);
			var template = '<div class="jsm-chat-message left jsm-generic-template-wrapper"><div class="jsm-generic-template-background">';
			$.each(items, function(index, item) {
				template += '<div class="jsm-generic-template ' + (index === 0 ? 'selected' : '') + '">';
				if (item.imageUrl) {
					template += '<div class="image" style="background-image: url(\'' + item.imageUrl + '\');"></div>';
				}
				template += '<div class="title"><p>' + item.title + '</p><p>' + item.subtitle + '</p></div>';
				$.each(item.buttons, function(index2, button) {
					template += '<div class="button">' + button + '</div>';
				});
				template += '</div>';
			});
			template += '</div></div>';
			this._addNewContent(this.options.leftUser, $(template), options.timestamp);
			var $templates = this.$element.find('.jsm-generic-template-wrapper:last .jsm-generic-template');
			// Adjust width of items
			var width = this.$element.width();
			$templates.css('width', 'calc(' + width + 'px - 6em - 4px)'); // FIXME extract margins (3em left / 3em right) and visible border sizes (4x 1px) from elements
			// Adjust height of titles
			var $titles = $templates.find('.title');
			$titles.css('height', Math.max.apply(Math, $titles.map(function() { return $(this).height(); })) + 'px');
		} else {
			this.options.script.push({
				method: 'showGenericTemplate',
				args: [ items, this._clearOptions(options) ],
				delay: options.delay
			});
		}
	}

	Plugin.prototype.scrollGenericTemplate = function(itemIndex, options) {
		if (options === undefined || options.delay === undefined) {
			this._checkWelcomeMessage();
			this._checkQuickReply(false);
			var $scroller = this.$element.find('.jsm-generic-template-wrapper:last');
			var width = $scroller.find('.jsm-generic-template:first').outerWidth(true) + 2;
			$scroller.find('.jsm-generic-template').removeClass('selected');
			$scroller.find('.jsm-generic-template:nth-child(' + (itemIndex + 1) + ')').addClass('selected');
			$scroller.animate({
				scrollLeft: itemIndex * width
			}, 500);
		} else {
			this.options.script.push({
				method: 'scrollGenericTemplate',
				args: [ itemIndex ],
				delay: options.delay
			})
		}
	}

	Plugin.prototype.selectGenericTemplate = function(buttonIndex, options) {
		if (options === undefined || options.delay === undefined) {
			this._checkWelcomeMessage();
			this._checkQuickReply(false);
			var $button = this.$element.find('.jsm-generic-template-wrapper:last .jsm-generic-template.selected .button:eq(' + buttonIndex + ')').addClass('selected');
			setTimeout(function() {
				$button.removeClass('selected');
			}, 1500);
			this.message(this.options.rightUser, $button.text(), { timestamp: false });
		} else {
			this.options.script.push({
				method: 'selectGenericTemplate',
				args: [ buttonIndex, this._clearOptions(options) ],
				delay: options.delay
			});
		}
	}

	Plugin.prototype.run = function() {
		if (this.options.script.length === 0) {
			$.error('script is empty');
		}
		var that = this;
		var schedule = function(index) {
			if (index > that.options.script.length - 1 && that.options.loop) {
				that.reset();
				index = 0;
			}
			var item = that.options.script[index];
			if (item) {
				setTimeout(function() {
					Plugin.prototype[item.method].apply(that, item.args);
					schedule(index + 1);
				}, item.delay);
			}
		};
		schedule(0);
	}

	Plugin.prototype.reset = function() {
		$(this.element).find('.jsm-chat-content > :not(".jsm-bot-welcome-message,.jsm-bot-info")').remove();
		$(this.element).find('.jsm-bot-welcome-message,.jsm-get-started-button').removeClass('jsm-hide');
		$(this.element).find('.jsm-input-message').addClass('jsm-hide');
		$(this.element).find('.jsm-chat-content')[0].scrollTop = 0;
		this.options.state.welcomeMessageDisplayed = true;
		this.options.state.quickRepliesDisplayed = false;
	}

	$.fn.fbMessenger = function(options) {
		if (options === undefined || typeof options === 'object') {
			return this.each(function() {
				if (!$(this).data(DATA_ATTRIBUTE)) {
					$(this).data(DATA_ATTRIBUTE, new Plugin(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			var args = Array.prototype.slice.call(arguments, 1);
			return this.each(function() {
				var plugin = $(this).data(DATA_ATTRIBUTE);
				if (plugin instanceof Plugin && typeof plugin[options] === 'function') {
					plugin[options].apply(plugin, args);
				}
			});
		}
	};

}(jQuery));
