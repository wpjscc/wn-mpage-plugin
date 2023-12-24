/*
 * Builder Index controller Controller entity controller
 */
+function ($) { "use strict";

    if ($.wn.mpage === undefined)
        $.wn.mpage = {}

    if ($.wn.mpage.entityControllers === undefined)
        $.wn.mpage.entityControllers = {}

    var Base = $.wn.mpage.entityControllers.base,
        BaseProto = Base.prototype

    var Controller = function(indexController) {
        Base.call(this, 'controller', indexController)
    }

    Controller.prototype = Object.create(BaseProto)
    Controller.prototype.constructor = Controller

    // PUBLIC METHODS
    // ============================

    Controller.prototype.cmdOnMPage = function(ev) {
        // var $currentTarget = $(ev.currentTarget),
        //     url = $currentTarget.data('build-url')

        // console.log($currentTarget, url)

        var $form = $(ev.currentTarget),
            url = $form.data('mpage-url')

        console.log($form, url, this.makeTabId(url))

        // If behaviors were selected, open a new tab after the 
        // controller is saved. Otherwise just update the controller
        // list.
        if ('parentIFrame' in window) {
            console.log('child iframe')
            window.parentIFrame.sendMessage({
                type:"mpage",
                data:{
                    type: 'cmd',
                    cmd: {
                        command:"controller:cmdOnMPage",
                        url: url
                    }
                    
                }
            });
        } else {
            
            this.indexController.openOrLoadMasterTab(
                $form,
                'onMPage',
                url,
                $form.data()
            )
        }

    }

    // REGISTRATION
    // ============================

    $.wn.mpage.entityControllers.controller = Controller;

}(window.jQuery);