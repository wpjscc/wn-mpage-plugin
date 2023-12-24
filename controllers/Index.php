<?php namespace Wpjscc\MPage\Controllers;

use Backend\Classes\Controller;
use BackendMenu;

class Index extends Controller
{
    public $implement = [    ];
    
    public function __construct()
    {
        parent::__construct();
        $this->bodyClass = 'compact-container';
        BackendMenu::setContext('Wpjscc.MPage', 'mpage');

    }

    public function index()
    {
        // $this->addJs('/plugins/wpjscc/mpage/assets/js/iframeResizer.min.js');
        // $this->addJs('/plugins/wpjscc/mpage/assets/js/mpage.index.entity.base.js');
        // $this->addJs('/plugins/wpjscc/mpage/assets/js/mpage.index.entity.controller.js');
        // $this->addJs('/plugins/wpjscc/mpage/assets/js/mpage.index.js');
    }

    public function onWelcome()
    {
        $result = [
            'tabTitle' => 'Welcome',
            'tabIcon' => 'icon-door-open',
            'tabId' => 'welcome',
            'tab' => $this->makePartial('welcome'),
        ];

        return $result;
    }

}
