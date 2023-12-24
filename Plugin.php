<?php namespace Wpjscc\MPage;

use System\Classes\PluginBase;
use Request;
use Block;
use Wpjscc\MPage\Models\MPageSetting;

class Plugin extends PluginBase
{
    public function registerComponents()
    {
    }

    public function registerSettings()
    {
        return [
            'mpage_settings' => [
                'label'       => 'wpjscc.mpage::lang.settings.label',
                'description' => 'wpjscc.mpage::lang.settings.description',
                'category'    => 'wpjscc.mpage::lang.settings.category',
                'icon'        => 'icon-cog',
                'class'       => 'Wpjscc\MPage\Models\MPageSetting',
                'order'       => 500,
                'keywords'    => 'mpage',
                'permissions' => ['wpjscc.mpage.access_settings'],
            ]
        ];
    }


    public function boot()
    {
        
        $this->initMpage();

    }

    protected function initMpage()
    {
        \Backend\Classes\Controller::extend(function($controller) {
            $controller->addViewPath('~/plugins/wpjscc/mpage/partials');
            $controller->implement[] = \Wpjscc\MPage\Behaviors\TabBehavior::class;
            if (!Request::ajax()) {
                $controller->addJs([
                    '/plugins/wpjscc/mpage/assets/js/util.js',
                    '/plugins/wpjscc/mpage/assets/js/iframeResizer.min.js',
                    '/plugins/wpjscc/mpage/assets/js/contentWindow.js',
                    '/plugins/wpjscc/mpage/assets/js/iframeResizer.contentWindow.min.js',
                    '/plugins/wpjscc/mpage/assets/js/mpage.index.entity.base.js',
                    '/plugins/wpjscc/mpage/assets/js/mpage.index.entity.controller.js',
                    '/plugins/wpjscc/mpage/assets/js/mpage.index.js',
                ]);
            }
            
        });


        \Event::listen('backend.page.beforeDisplay', function (\Backend\Classes\Controller $controller, $action, $params) {

            if (MPageSetting::get('is_list_open')) {
                if ($controller->isClassExtendedWith('Backend\Behaviors\ListController')) {
                    $controller::extendListColumns(function ($list, $model) {
                        if (!str_contains($list->alias, 'relation')) {
                            $list->addColumns([
                                'new_mpage_tab' => [
                                    'label' => 'wpjscc.mpage::lang.list.new_mpage_tab',
                                    'type' => 'partial',
                                    'clickable' => false,
                                    'searchable' => false,
                                    'sortable' => false,
                                ]
                            ]);
                        }

                    });
                }
            }
            

            $controller->extend(function() {
                $this->layoutPath[]='~/plugins/wpjscc/mpage/layouts';

                if (request()->header('X-MPage') == 'onIframeRequest' || request()->header('Sec-Fetch-Dest') == 'iframe' || request()->get('is_mpage_iframe') == 1) {
                    $this->layout = 'mpage_side_default';
                } else {

                    if (MPageSetting::get('is_open')) {
                        $this->bodyClass = 'compact-container';
                        $this->layout = 'mpage_main_default';
                    }
                    
                }
            }, $controller);

            if (request()->header('X-MPage') == 'onIframeRequest' || request()->header('Sec-Fetch-Dest') == 'iframe' || request()->get('is_mpage_iframe') == 1) {
                // Block::set('mpageSetting', $controller->makePartial('mpage_setting'));
            } else {
                // 说明是主页面
                if (MPageSetting::get('is_open')) {
                    if (!Request::ajax()) {
                        $response = '';
                        $controller->extend(function() use (&$response) {
                            $result = $this->execPageAction('mpage', $this->params);
                            $response = $this->makeResponse($result);
                        }, $controller);
        
                        if ($response) {
                            return $response;
                        }
                    } 
                }
                
               
            }

         });
    }
}
