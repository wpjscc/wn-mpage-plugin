/*
 * MPage client-side Index page controller
 */
+function ($) { "use strict";

    if ($.wn.mpage === undefined)
        $.wn.mpage = {}

    var Base = $.wn.foundation.base,
        BaseProto = Base.prototype

    var MPage = function() {
        Base.call(this)

        this.$masterTabs = null
        this.$welcomeTab = null
        this.$setting = null
        this.masterTabsObj = null
        this.hideStripeIndicatorProxy = null
        this.entityControllers = {}

        this.init()
    }

    MPage.prototype = Object.create(BaseProto)
    MPage.prototype.constructor = MPage

    MPage.prototype.dispose = function() {
        // We don't really care about disposing the
        // index controller, as it's used only once
        // and always exists during the page life.
        BaseProto.dispose.call(this)
    }

    // PUBLIC METHODS
    // ============================

    MPage.prototype.openOrLoadMasterTab = function ($form, serverHandlerName, tabId, data) {
        console.log(tabId, 'tabId')
        if (this.masterTabsObj.goTo(tabId)) {
            return false
        }

        var requestData = data === undefined ? {} : data

        var iframe_html=`<iframe 
        src="${tabId}" 
        data-tab-id="${tabId}"
        class="mpage-iframe"
        width="100%"
        height="100%"
        title="W3Schools Free Online Web Tutorials" frameborder="0"></iframe>
        `
        this.addMasterTab({
            tabTitle: 'Index',
            tab: iframe_html,
            tabId: tabId,
            tabIcon: 'icon-refresh',
            isNewRecord: true
        })
        return Promise.resolve(true)
        $.wn.stripeLoadIndicator.show()
        var promise = $form.request(
                serverHandlerName,
                { data: requestData }
            )
            .done(this.proxy(this.addMasterTab))
            .always(
                this.hideStripeIndicatorProxy
            )
        return promise
    }

    MPage.prototype.getMasterTabActivePane = function() {
        return this.$masterTabs.find('> .tab-content > .tab-pane.active')
    }

    MPage.prototype.getMasterTabActive = function () {
        return this.$masterTabs.find('.tabs-container > ul > li.active')
    }

    MPage.prototype.unchangeTab = function($pane) {
        $pane.find('form').trigger('unchange.oc.changeMonitor')
    }

    MPage.prototype.triggerCommand = function(command, ev) {
        var commandParts = command ? command.split(':') : ['controller', 'cmdOnMPage']
        if (commandParts.length === 2) {
            var entity = commandParts[0],
                commandToExecute = commandParts[1]

            if (this.entityControllers[entity] === undefined) {
                throw new Error('Unknown entity type: ' + entity)
            }

            this.entityControllers[entity].invokeCommand(commandToExecute, ev)
        }
    }

    // INTERNAL METHODS
    // ============================

    MPage.prototype.init = function () {
        this.$masterTabs = $('#mpage-master-tabs')
        this.$sidePanel = $('#mpage-side-panel')
        this.$setting = $('#mpage-setting')


        this.createEntityControllers()
       
        this.pageInit()

        this.masterTabsObj = this.$masterTabs.data('oc.tab')
        this.hideStripeIndicatorProxy = this.proxy(this.hideStripeIndicator)
        // new $.wn.tabFormExpandControls(this.$masterTabs)
        this.registerHandlers()

        if (window.self === window.top) {
            this.addFirstTab()
        }

        // setTimeout(() => {
        //     $(document).render(this.proxy(this.pageInit))
        // }, 300);
        //this.addWelcomeTab()
        


    }

    MPage.prototype.pageInit = function () {
        var that = this

        // 在子和父iframe中（一键支持所有a标签）

        $('a[href^="http"]:not([not-mpage]), a[href^="/"]:not([not-mpage])').on('click', function (event) {
            if ('parentIFrame' in window) {
                console.log('childIFrame')
            } else {
                console.log('parentIFrame')
                var time=''

                // 说明是main nav
                if ($(this).closest('.nav.mainmenu-nav > li > a').length > 0) {
                }
                // side nav
                else if ($(this).closest('#layout-sidenav > ul > li > a').length > 0) {
                } 
                // 其他标签
                else {
                    time = new Date().getTime()
                }
    
                var url = $(this).attr('href')
                // if (time) {
                //     url = appendUrlParam(url, {
                //         time: time
                //     })
                // }
                event.preventDefault()
    
                that.tabUrl({
                    url: url
                })
            }
           
        })

       
        // 在子iframe中
        if (this.$masterTabs.length == 0 ) {

            $('form').on('changed.oc.changeMonitor', function(event){
                if ('parentIFrame' in window) {
            
                    window.parentIFrame.sendMessage({
                        type: "mpage",
                        data: {
                            type: 'event',
                            event: {
                                event_type: 'changed.oc.changeMonitor'
                            }
                        
                        }
                    });
                    event.preventDefault()
                }
            })
            
            $('[data-mpage-url]').on('click', function(event) {
                if ('parentIFrame' in window) {
                    window.parentIFrame.sendMessage({
                        type: "mpage",
                        data: {
                            type: 'cmd',
                            cmd: {
                                command: "controller:cmdOnMPage",
                                url: $(this).data('mpage-url'),
                            }
                            
                        }
                    });
                    event.preventDefault()
                } 
    
            })
        }
        


    }

    MPage.prototype.initIframe = function (tabId) { 

        var that = this
        $('iframe[data-tab-id="' + tabId + '"]').iFrameResize({
            autoResize: false,
            sizeHeight: false,
            scrolling: true,
            // sizeWidth: true,
            // log: true,
            onMessage({ iframe, message }) {
                if (message && message.type) {
                    console.log(message)
                    var type = message.type
                    if (type == 'mpage') {
                        if (message.data.type == 'cmd') {
                            that.tabUrl({
                                url: message.data.cmd.url,
                                command: message.data.cmd.command
                           })
                        } else if (message.data.type == 'event') {
                            var data = message.data.event
                            if (data.event_type == 'changed.oc.changeMonitor') {
                                that.getMasterTabActive().trigger('modified.oc.tab')
                            } else if (data.event_type == 'setTitle') {
                                var titles = data.data.title.split('|')
                                titles.pop()
                                var title = titles.join('|')
                                that.setPageTitle(title)
                                $('li[data-tab-id="' + $(iframe).data('tab-id') + '"]').find('a').attr('title', title)
                                $('li[data-tab-id="' + $(iframe).data('tab-id') + '"]').find('a > span').attr('title', title)
                                $('li[data-tab-id="' + $(iframe).data('tab-id') + '"]').find('a > span').text(title)
                            } else if (data.event_type == 'reportHref') {
                                return;

                                var href = data.data.href
                                var origin_src = $(iframe).attr('src')
                                var src = $(iframe).attr('src')

                                console.log('href', href, $(iframe).attr('src'), $(iframe).data('tab-id'))

                                if (!src.startsWith('http')) {
                                    src = location.origin + src
                                }


                                // iframe的src 和 href不一致
                                if (href.split('?')[0] != src.split('?')[0]) {

                                    that.tabUrl({
                                        url: href
                                    })
                                    
                                    // iframe不在主导航中
                                    if($('.nav.mainmenu-nav > li > a').filter(function () {
                                        return $(this).attr('href') == src.split('?')[0]
                                    }).length == 0) {
                                        setTimeout(() => {
                                            that.$masterTabs.ocTab('closeTab', '[data-tab-id="'+$(iframe).data('tab-id')+'"]', true)
                                        }, 300);
                                    } else {
                                        // 当前iframe 在主nav中 只不过跳转到详情页了，这里再回到iframe（rowlink的情况）
                                        $('iframe[data-tab-id="' + $(iframe).data('tab-id') + '"]').attr('src', 'about:blank')
                                        const _t = setTimeout(()=>{
                                            $('iframe[data-tab-id="' + $(iframe).data('tab-id') + '"]').attr('src', origin_src)
                                            clearTimeout(_t)
                                        }, 300)
                                    }
                                    
                                   

                                }
                                
                            }
                        }
                       
                    }
                }
            }
        })
    }

    MPage.prototype.tabUrl = function ({ url, command }) { 
        var mpageSetting = document.getElementById('mpage-setting')
        if (mpageSetting) { 
            mpageSetting = $(mpageSetting).data()
            console.log('mpageSetting', mpageSetting)
            if (mpageSetting && mpageSetting.isForceOpenNewTab) {
                url = appendUrlParam(url, {
                    time: new Date().getTime()
                })
            }
        }
        if ('parentIFrame' in window) {
            window.parentIFrame.sendMessage({
                type: "mpage",
                data: {
                    type: 'cmd',
                    cmd: {
                        command: "controller:cmdOnMPage",
                        url: url,
                    }
                    
                }
            });
        } else {
            if (this.$masterTabs.length === 0) {
                location.href = url
            } else {
                const button = document.createElement('button')
                button.setAttribute('data-mpage-url', url)
                button.setAttribute('data-mpage-command', command ? command : 'controller:cmdOnMPage')
                button.style.display = 'none'
                document.body.appendChild(button)
                $(button).click()
            }
          
        }
       
    }

    MPage.prototype.openNewTab = function ({ url, command }) { 
        
        if (url.indexOf('http') !== 0) { 
            url = location.origin + url
        }

        if ('parentIFrame' in window) {
            this.tabUrl({
                url: url,
                command
           })
        } else {
            // 没有tab支持
            if (this.$masterTabs.length === 0) {
                location.href = url
            } else {
                this.tabUrl({
                    url: url,
                    command
               })
            }
        }
        
    }

    MPage.prototype.openListNewTab = function (event) { 
        
        var link = $(event.target).closest('tr').find('a').filter(function(){
            return !$(this).closest('td').hasClass('nolink') && !$(this).hasClass('nolink')
        }).first()
        console.log(event)
        if (link.length && link.attr('href')) {
            // this.openNewTab({
            //     url: appendUrlParam(link.attr('href'), {
            //         time: new Date().getTime()
            //     })
            // })
            this.openNewTab({
                url: link.attr('href')
            })
        }
    }
    MPage.prototype.addFirstTab = function () { 
        if (this.$masterTabs.length > 0) {
            this.tabUrl({
                url: location.href
            })
        }

    }

    MPage.prototype.addWelcomeTab = function() {
        var that = this

        $.wn.stripeLoadIndicator.show()
        $.request(
            'onWelcome',
            {
                url: '/backend/wpjscc/mpage',
            }
        )
        .done(function (data) {
            that.addMasterTab(data)
            that.$welcomeTab = that.getMasterTabActivePane()
        })
        .always(this.hideStripeIndicatorProxy)
    }

    MPage.prototype.hideWelcomeTab = function () {
        if (!this.$welcomeTab) {
            return;
        }

        var tab = this.masterTabsObj.findTabFromPane(this.$welcomeTab).parent()
        console.log(tab)
        this.masterTabsObj.closeTab(tab)
    }

    MPage.prototype.createEntityControllers = function() {
        for (var controller in $.wn.mpage.entityControllers) {
            if (controller == "base") {
                continue
            }

            this.entityControllers[controller] = new $.wn.mpage.entityControllers[controller](this)
        }
    }

    MPage.prototype.registerHandlers = function () {
        // 内部触发
        $(document).on('click', '[data-mpage-url]', this.proxy(this.onCommand))
        $(document).on('submit', '[data-mpage-url]', this.proxy(this.onCommand))


        this.$masterTabs.on('changed.oc.changeMonitor', this.proxy(this.onFormChanged))
        this.$masterTabs.on('unchanged.oc.changeMonitor', this.proxy(this.onFormUnchanged))
        this.$masterTabs.on('shown.bs.tab', this.proxy(this.onTabShown))
        this.$masterTabs.on('afterAllClosed.oc.tab', this.proxy(this.onAllTabsClosed))
        this.$masterTabs.on('closed.oc.tab', this.proxy(this.onTabClosed))
        this.$masterTabs.on('autocompleteitems.oc.inspector', this.proxy(this.onDataRegistryItems))
        this.$masterTabs.on('dropdownoptions.oc.inspector', this.proxy(this.onDataRegistryItems))

        

        for (var controller in this.entityControllers) {
            if (this.entityControllers[controller].registerHandlers !== undefined) {
                this.entityControllers[controller].registerHandlers()
            }
        }
    }

    MPage.prototype.hideStripeIndicator = function() {
        $.wn.stripeLoadIndicator.hide()
    }

    MPage.prototype.addMasterTab = function(data) {
        this.masterTabsObj.addTab(data.tabTitle, data.tab, data.tabId, 'wn-' + data.tabIcon)
        if (data.isNewRecord) {
            var $masterTabPane = this.getMasterTabActivePane()

            $masterTabPane.find('form').one('ready.oc.changeMonitor', this.proxy(this.onChangeMonitorReady))
        }

        this.initIframe(data.tabId)
    }

    MPage.prototype.updateModifiedCounter = function() {
        
    }

    MPage.prototype.getSelectedPlugin = function () {
        var $activeItem = $('#PluginList-pluginList-plugin-list > ul > li.active')

        if (!$activeItem.length) {
            return false
        }

        return $activeItem.data('id');
    }

    MPage.prototype.getFormPluginCode = function(formElement) {
        var $form = $(formElement).closest('form'),
            $input = $form.find('input[name="plugin_code"]'),
            code = $input.val()

        if (!code) {
            throw new Error('Plugin code input is not found in the form.')
        }

        return code
    }

    MPage.prototype.setPageTitle = function(title) {
        $.wn.layout.setPageTitle(title.length ? (title + ' | ') : title)
    }

    MPage.prototype.getFileLists = function() {
        return $('[data-control=filelist]', this.$sidePanel)
    }

    MPage.prototype.dataToInspectorArray = function(data) {
        var result = []

        for (var key in data) {
            var item = {
                title: data[key],
                value: key
            }
            result.push(item)
        }

        return result
    }

    // EVENT HANDLERS
    // ============================

    MPage.prototype.onCommand = function (ev) {
        ev.preventDefault()
        
        if (ev.currentTarget.tagName == 'FORM' && ev.type == 'click') {
            // The form elements could have data-mpage-command attribute,
            // but for them we only handle the submit event and ignore clicks.

            return
        }

        var command = $(ev.currentTarget).data('mpageCommand')
        this.triggerCommand(command, ev)

        // Prevent default for everything except drop-down menu items
        //
        var $target = $(ev.currentTarget)
        if (ev.currentTarget.tagName === 'A' && $target.attr('role') == 'menuitem' && $target.attr('href') == 'javascript:;') {
            return
        }

        ev.preventDefault()
        return false
    }

    MPage.prototype.onFormChanged = function(ev) {
        $('.form-tabless-fields', ev.target).trigger('modified.oc.tab')
        this.updateModifiedCounter()
    }

    MPage.prototype.onFormUnchanged = function(ev) {
        $('.form-tabless-fields', ev.target).trigger('unmodified.oc.tab')
        this.updateModifiedCounter()
    }

    MPage.prototype.onTabShown = function (ev) {
        var $tabControl = $(ev.target).closest('[data-control=tab]')

        if ($tabControl.attr('id') != this.$masterTabs.attr('id')) {
            return
        }
        // console.log('show tab')
        
        //console.log($tabControl)

        var dataId = $(ev.target).closest('li').attr('data-tab-id'),
            title = $(ev.target).attr('title')

        if (title) {
            this.setPageTitle(title)
        }

        this.getFileLists().fileList('markActive', dataId)

        $(window).trigger('resize')
    }

    MPage.prototype.onAllTabsClosed = function(ev) {
        this.setPageTitle('')
        this.getFileLists().fileList('markActive', null)
    }

    MPage.prototype.onTabClosed = function(ev, tab, pane) {
        $(pane).find('form').off('ready.oc.changeMonitor', this.proxy(this.onChangeMonitorReady))

        this.updateModifiedCounter()
    }

    MPage.prototype.onChangeMonitorReady = function(ev) {
        $(ev.target).trigger('change')
    }

    MPage.prototype.onDataRegistryItems = function(ev, data) {
    
    }

    // INITIALIZATION
    // ============================

    $(document).ready(function(){
        $.wn.mpage.indexController = new MPage()
    })
    if (window.self !== window.top) {
        $.ajaxSetup({
            headers: {
              'X-Mpage': 'onIframeRequest',
            }
          });
        console.log('The page is loaded inside an iframe.');
    } else {
        console.log('The page is not loaded inside an iframe.');
    }

}(window.jQuery);
