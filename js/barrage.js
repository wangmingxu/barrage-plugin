/**
 * Created by wmx on 2017/8/12.
 */
(function(global, factory) {
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS:
        factory(require('jquery'));
    } else {
        // Browser globals:
        factory(window.jQuery);
    }

})(this, function($) {

    var NAME = "Barrage",
        VERSION = "1.0.0",
        BARRAGE_KEY = 'barrage',
        DATA_KEY = 'mx-barrage',
        CONTAINER_CLASS = 'mx-barrage-container',
        JQUERY_NO_CONFLICT = $.fn[NAME];

    var Default = {
        template: '<div class="mx-barrage">' +
                  '<img class="mx-barrage-avatar"/>' +
                  '<div class="mx-barrage-msg"></div>' +
                  '</div>',
        liOffset: {
            top: 20,
            bottom: 20
        },
        loop: true,
        totalLine: 3,
        // direction: 'left',
        // liWidth: 200,
        width: 'auto',
        height: 'auto',
        statusClass: {
            success: 'mx-barrage-success',
            warning: 'mx-barrage-warning',
            danger: 'mx-barrage-danger',
            normal: 'mx-barrage-normal'
        },
        status: 'danger',
        loopTimerMax: 1500,
        loopTimerMin: 1000,
        moveTimeMax: 4000,
        moveTimeMin: 3000
    };

    var Barrage = (function($) {
        var Barrage = function(element, config) {
            this._config = this._getConfig(config);
            this._$element = $(element);
            this._$element.data(BARRAGE_KEY, this);
            this._$element.addClass(CONTAINER_CLASS);
            this._isPlayed = false;
            this._timerList = [];
        };
        Barrage.prototype.play = function(args) {
            if (this._isPlayed) {
                return this;
            }
            var barrageDataList = $.isArray(args[0])
                ? args[0]
                : [];
            var barrageDataBackup = barrageDataList.slice(0);

            var config = args[1];
            if (typeof config === "object") {
                $.extend(this._config, config);
            }
            for (var i = 0; i < this._config.totalLine; i++) {
                ($.proxy(function(i) {
                    var timer = setInterval($.proxy(function() {
                        // debugger
                        var barrageData,
                            _tm;
                        if (barrageDataList.length < 1) {
                            if (this._config.loop) {
                                barrageDataList = barrageDataBackup.slice(0);
                            } else {
                                return false;
                            }
                        }
                        barrageData = barrageDataList.shift();
                        _tm = new TipManager(this._config.template);
                        _tm.text(barrageData.msg);
                        _tm.setAvatar(barrageData.avatar);
                        _tm._$tip.css('top', this._calcLineTop(i)).css('left', this._$element.width());
                        if (barrageData.status) {
                            _tm._$tip.addClass(this._config.statusClass[barrageData.status]);
                        } else {
                            _tm._$tip.addClass(this._config.statusClass[this._config.status]);
                        }
                        this._$element.append(_tm._$tip);
                        this._moveTip(_tm._$tip);
                    }, this), this._getIntervalTime());
                    this._timerList.push(timer);
                }, this)(i));
            }
            this._isPlayed = true;
            return this;

        };
        Barrage.prototype._getIntervalTime = function() {
            var max = this._config.loopTimerMax;
            var min = this._config.loopTimerMin;
            return this._getRandomNum(max, min);
        }
        Barrage.prototype._getMoveTime = function() {
            var max = this._config.moveTimeMax;
            var min = this._config.moveTimeMin;
            return this._getRandomNum(max, min);
        }
        Barrage.prototype._getRandomNum = function(max, min) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
        Barrage.prototype._calcLineTop = function(lineNo) {
            var liOffset = this._config.liOffset;
            var eleH = this._$element.height();
            var lineHeight = (eleH - liOffset.top - liOffset.bottom) / this._config.totalLine;
            return (lineHeight * lineNo + liOffset.top) + 'px';
        };
        Barrage.prototype._moveTip = function(tip) {
            var _$tip = $(tip);
            _$tip.animate({
                'left': '-' + _$tip.width() + 'px'
            }, this._getMoveTime(), 'linear', function() {
                _$tip.remove();
            });
        };
        Barrage.prototype.destroy = function() {
            $.each(this._timerList, function(index, timer) {
                clearInterval(timer);
            });
            this._$element.removeData(BARRAGE_KEY).removeClass(CONTAINER_CLASS);
            this._isPlayed = false;
            delete this;
        };
        Barrage.prototype._getConfig = function(config) {
            return $.extend(true, {}, Default, config);
        };
        Barrage._jQueryInterface = function(config) {
            var args = [].slice.call(arguments, 1);
            return this.each(function(i, elem) {

                var data,
                    _config,
                    barrage;

                data = $(elem).data(DATA_KEY);
                _config = $.extend(true, {}, data, typeof config === 'object'
                    ? config
                    : null);
                barrage = $(elem).data(BARRAGE_KEY);
                if (!barrage) {
                    barrage = new Barrage(elem, _config);
                }
                if (typeof config == "string") {
                    barrage[config](args);
                } else if (_config.play) {
                    barrage.play(args);
                }
            })
        };
        return Barrage;

    })($);

    $.fn[NAME] = Barrage._jQueryInterface;
    $.fn[NAME].Constructor = Barrage;
    $.fn[NAME].noConflict = function() {
        $.fn[NAME] = JQUERY_NO_CONFLICT;
        return Barrage._jQueryInterface;
    };
    var TipManager = (function($) {

        var SELECTOR = {
            TEXT: ".mx-barrage-msg",
            AVATAR: ".mx-barrage-avatar"
        };
        var TipManager = function(tip) {
            this._$tip = $(tip);
        };
        TipManager.prototype.text = function(msg) {
            if (typeof msg == 'string') {
                this._setText(msg);
                return this;
            } else {
                return this._getText();
            }
        };
        TipManager.prototype.setAvatar = function(url) {
            this.getAvatarElement().attr('src', url);
        };
        TipManager.prototype._setText = function(msg) {
            this._$tip.find(SELECTOR.TEXT).html(msg);
        };
        TipManager.prototype._getText = function() {
            return this._$tip.find(SELECTOR.TEXT).html();
        };
        TipManager.prototype.getContentElement = function() {
            return this._$tip.find(SELECTOR.TEXT);
        };
        TipManager.prototype.getAvatarElement = function() {
            return this._$tip.find(SELECTOR.AVATAR);
        };

        return TipManager;
    })($);
    typeof module == 'object' && (module.exports = Barrage);
});
