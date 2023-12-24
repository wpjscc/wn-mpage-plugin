<?php namespace Wpjscc\MPage\Models;

use Model;

/**
 * MPageSetting Model
 */
class MPageSetting extends Model
{
    use \Winter\Storm\Database\Traits\Validation;

    /**
     * @var array Behaviors implemented by this model.
     */
    public $implement = [\System\Behaviors\SettingsModel::class];

    /**
     * @var string Unique code
     */
    public $settingsCode = 'wpjscc_mpage_mpagesetting';

    /**
     * @var mixed Settings form field definitions
     */
    public $settingsFields = 'fields.yaml';

    /**
     * @var array Validation rules
     */
    public $rules = [];


    public function initSettingsData()
    {
        $this->is_open = 0;
        $this->is_list_open = 0;
        // $this->include_a_selector = 'a[href^="http"],a[href^="/"]';
        // $this->except_a_selector = 'control-breadcrumb > ul > a';
    }
    
}
