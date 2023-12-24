<div class="layout padded-container">
    <div class="layout-row">
        <div class="layout-cell center middle">
            <div class="layout-row">
                <i class="icon-wrench icon-3x text-muted"></i>
            </div>
            <div class="layout-row">
                <h3>
                    <?= e(trans('winter.mpage::lang.welcome.heading')) ?>
                </h3>
                <p>
                    <?= e(trans('winter.mpage::lang.welcome.description')) ?>
                </p>
            </div>

            <div class="layout-row m-t">
                <button
                    class="btn btn-primary btn-lg"
                    data-mpage-url="https://wintercms122.xiaofuwu.wpjs.cc/backend/winter/blog/posts"
                >
                    <?= e(trans('wpjscc.mpage::lang.welcome.start_button')) ?>
                </button>

                <button
                    data-mpage-url="https://wintercms122.xiaofuwu.wpjs.cc/backend/winter/builder"

                    class="btn btn-default btn-lg"
                >
                    <?= e(trans('winter.mpage::lang.welcome.show_button')) ?>
                </button>
            </div>
        </div>
    </div>
</div>
