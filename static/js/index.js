var mainClass = {
    headerObj: '#headerBox',
    headerHeight: $('#headerBox').outerHeight(),
    swiperHeight: $('#swiperContainer').height(),
	init: function() {
        var _this = this;

        // ie兼容
		if(!!window.ActiveXObject || "ActiveXObject" in window) {
			var element=document.getElementsByTagName("body")[0];
			element.className = 'ie9';
		}

		//切换语言
        _this.changeLangage();
        _this.listHeight('#inventList');  // 投资人一列的高度

        // 团队列计算以及高度计算
        $('.team-all').each(function() {
            var li = $(this).find('li');

            if(li.length == 1) {
                li.css('width', '100%');
                li.find('.list').css({ width: '100%', maxWidth: '330px', margin: '0 auto' });
            } else if(li.length == 2) {
                $(this).addClass('len2');
            } else if(li.length == 3) {
                $(this).addClass('len3');
            }

            if(li.length != 1) {
                _this.listHeight(this);   // 团队一列的高度
            }
        });

		// footer，pc鼠标经过，触屏版点击
		if(!_this.isPc()) {
		    _this.wapOparate();
		} else {
            _this.pcOparate();     // pc的一些操作
		}

		// 滚动banner插件
        var swiper = new Swiper('.swiper-container', {
            paginationClickable: true,
            pagination: '.swiper-pagination',
            loop: true,
            autoplay: 4000,
            autoplayDisableOnInteraction: false
        });

		// 导航点击
		$(_this.headerObj + ' .header-nav li').on('touch click', function() {
			var tab = $(this).attr('tab'),
                self = $(this),
                t = $('#' + tab)[0] ? $('#' + tab).offset().top : 0;

			if(tab) {
                _this.allClass(self, 'on')
                self.addClass('active');
            }

            $("body,html").animate({scrollTop: t}, 300, function() {
                self.removeClass('active');
            });

			if($('.header-nav').hasClass('on')) {
                $('.header-nav').removeClass('on');
            }
		});

        // 触屏版导航点击
        $(this.headerObj + ' .icon').on('touch click', function() {
            var headerNav = $(_this.headerObj).find('.header-nav');

            _this.changeClass(!headerNav.hasClass('on'), headerNav, 'on');
        });

        //浏览器滚动的变化
        _this.scrollChange();
		$(window).scroll(function() {
		    _this.scrollChange();
		});

		// 浏览器宽度变化
		$(window).resize(function() {
		    var timer;

		    clearTimeout(timer);

		    timer = setTimeout(function() {
                _this.listHeight('#inventList');    // 投资人一列的高度
                _this.listHeight('#teamList');      // 团队一列的高度
            }, 1000);
        });
	},

    // pc的一些操作
    pcOparate: function() {
        $('.show-img').addClass('show-pc');

        // 底部hover出二维码
        $('#footerBox a').hover(function() {
            $(this).parent().find('.show-img').addClass('on');
        }, function() {
            $(this).parent().find('.show-img').removeClass('on');
        });
    },

    // 移动端的一些操作
    wapOparate: function() {
        var _this = this;
        $('.show-img').addClass('show-app');

        // 底部点击出二维码弹窗
        $('#footerBox a').on('touch click', function() {
            $(this).parent().find('.show-img').addClass('appOn');
        });

        //点击二维码弹窗背景层关闭
        $('.show-img').on('touch click', function(e) {
            if(e.target.nodeName != 'IMG') {
                $(this).removeClass('appOn');
            }
        });
    },

    //浏览器滚动的一些变化
    scrollChange: function() {
        var _this = this,
            sTop = $(window).scrollTop();

        _this.changeClass(sTop > 0, $(_this.headerObj), 'bg');    //banner滚动大于0增加背景色
        _this.changeClass(sTop > _this.swiperHeight - _this.headerHeight, $(_this.headerObj), 'on');    //banner滚动大于图片高度改变banner高度

        // 滚动选中menu
        if($('#headerBox li.active').length == 0) {
            $('.tab-floor').each(function() {
                if(sTop >= parseInt($(this).offset().top)) {
                    var id = $(this).attr('id');
                    _this.allClass($('#headerBox li[tab="'+ id +'"]'), 'on');
                } else if(sTop < $('.tab-floor').eq(0).offset().top) {
                    _this.allClass($('#headerBox li[tab="home"]'), 'on');
                }
            });
        }
    },

    // 初始化切换语言
    changeLangage: function() {
        var _this = this,
            type = _this.cookies.getCookies(),
            lanObj = $('#changeLang span[data-type="'+ type +'"]');

        if(type == null || lanObj.length == 0) {
            type = 'zh_HK';
        }

        _this.allClass($('#changeLang span[data-type="'+ type +'"]'), 'active');
        _this.guojihua(type);

        // 点击语言选项
        $('#changeLang span').on('touch click', function() {
            if(!$(this).hasClass('active')) {
                _this.allClass($(this), 'active');
                _this.guojihua($(this).data('type'));
            }
        });
    },

    // 切换语言插件
    guojihua: function(type) {
        var _this = this;
        _this.loading();
   
        try {
             jQuery.i18n.properties({ 
            name: 'strings',
            path: '/static/i18n/',
            mode: 'map', 
            language: type,
            callback: function () {
               $('.needReplace').each(function() {
                   var $this = $(this),
                       text = $.i18n.prop($(this).data('t'));
                   if ($this.hasClass('forEach')) {
                        text = text.split('split');

                        $this.find('.i').each(function(i) {
                            $(this).html(text[i]);
                        });
                   } else {
                    $this.html(text);
                   }
               });

               // 切换成功，头部显示当前字体
                var txtObj = $('#changeLang span[data-type="'+ type +'"]');
                _this.allClass(txtObj, 'active');

                // 切换图片
                $('.chang-pic').each(function() {
                    var src = $(this).data('src'),
                        name = $(this).data('name');

                    $(this).attr('src', src + name + '-' + type + '.png');
                });

                _this.cookies.setCookies(type);
                _this.loading('close');
            }
        });
        }catch(e) {
             _this.loading('close');
        }   
    },

    // 判断是否是pc浏览
	isPc: function() {
        var userAgentInfo = navigator.userAgent,
			Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"],
			flag = true;

        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }

        return flag;
	},

    changeClass: function(flag, obj, c) {
        if(flag) {
            obj.addClass(c);
        } else {
            obj.removeClass(c);
        }
    },

    allClass: function(obj, c) {
        obj.addClass(c).siblings().removeClass(c);
    },

    //计算一列.list最高的，赋值给当前列其他的list
    listHeight: function(obj) {
        var _this = this,
            ulWidth = $(obj).width(),
            liWidth = $(obj).find('li').width(),
            chu = parseInt(ulWidth/liWidth),
            liLen = $(obj).find('li').length,
            chuLen = Math.ceil(liLen/chu),
            hArr = [],
            maxH = 0;

        $(obj).find('li').each(function() {
            $(this).find('.list').css('height', 'auto');
            hArr.push($(this).height());
        });

        if(chu > 1) {
            for(var i = 1; i <= chuLen; i++) {
                var nowHeight = hArr.slice((i - 1) * chu, i * chu).sort(_this.compares)[0];

                for(var j = 1; j <= chu; j++) {
                    $(obj).find('li').eq((j + (i - 1)* chu) - 1).find('.list').css('height', nowHeight);
                }
            }
        }
    },

    //排序
    compares: function(a, b) {
        return b - a;
    },

    //load
    loading: function(obj) {
        var loadObj = $('#loading');

        if(obj == 'close') {
            loadObj.remove();
            this.isPageRoll(true);

            return;
        }

        if(!loadObj[0]) {
            $('body').append('<div id="loading"><p><span><em></em>loading</span></p></div>');
        }

        this.isPageRoll(false);
        $('#loading').show();
    },

    //不能存url参数，来回切换容易丢掉参数
    cookies: {
        key: 'language',
        //初始化读取cookie
        getCookies: function() {
            var value = '',
                key = this.key;

            //获取cookie
            if(window.localStorage) {
                value = localStorage.getItem(key);
            } else {
                var arr = document.cookie.match(new RegExp("(^| )"+ key +"=([^;]*)(;|$)"));

                value = arr != null ? unescape(arr[2]) : '';
            }

            return value;
        },

        //保存cookie
        setCookies: function(v) {
            var key = this.key;

            if(window.localStorage) {
                localStorage.setItem(key, v);
            } else {
                var Days = 30,
                    exp = new Date();

                exp.setTime(exp.getTime() + Days*24*60*60*1000);
                document.cookie = key + "="+ escape (v) + ";expires=" + exp.toGMTString();
            }
        },

        //删除cookie
        removeCookies: function() {
            var key = this.key;

            if(window.localStorage) {
                localStorage.removeItem(key);
            } else {
                var exp = new Date();
                exp.setTime(exp.getTime() - 1);
                var cval= this.getCookies(key);
                if(cval!=null)
                    document.cookie= key + "="+cval+";expires="+exp.toGMTString();
            }
        }
    },

    /*
   * 页面是否滚动true:可以滚动，false不能滚动
   * */
    isPageRoll: function(str) {
        str = str.toString();

        if (typeof str == 'undefined') {
            return;
        }
        if (str == 'true') {
            document.documentElement.style.overflow = 'auto';
        } else {
            document.documentElement.style.overflow='hidden';
        }
    }
};


mainClass.init();
