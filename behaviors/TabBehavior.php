<?php

namespace Wpjscc\MPage\Behaviors;

use Backend\Classes\ControllerBehavior;

class TabBehavior extends ControllerBehavior
{
    public function __construct($controller)
    {
        parent::__construct($controller);
        $this->controller->addViewPath('~/plugins/wpjscc/mpage/behaviors/tabbehavior');
    }

    public function mpage()
    {

    }
    public function onMPage()
    {
        $url = request('mpageUrl');

        if (!str_contains($url, 'is_mpage_iframe')) {
            if (str_contains($url, '?')) {
                // $url .= '&is_mpage_iframe=1';
            } else {
                // $url .= '?is_mpage_iframe=1';    
            }
        }
        $tabId = request('mpageUrl');
        return [
            'tabTitle' => 'Index',
            'tabIcon' => 'icon-refresh',
            'isNewRecord' => true,
            'tabId' => $tabId,
            'tab' => $this->controller->makePartial('mpage', [
                'url' => $url,
                'tab_id' => $tabId,
            ]),
        ];
    }
}