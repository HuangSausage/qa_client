// preview.html
$(function () {
    // 點選『選項』後，對 li 添加class:check
    $('.js-preview-option').on('click', function () {
        if ($(this).prop('checked')) {
            $('.js-preview-option').removeAttr('checked'); //全部移除 prop
            $('.js-preview-warp li').removeClass('check'); //全部移除 class
            $(this).attr('checked', 'checked'); //目標添加 check
            $(this).parent().addClass('check'); //目標父親
        }
    });


    // 當撰寫『其他選項』input時，check按鈕會自動跳到『其他選項』
    $('.choose-option-else textarea').on('keyup', function () {
        $('.js-preview-option').removeAttr('checked'); //全部移除 prop
        $('.js-preview-warp li').removeClass('check'); //全部移除 class
        $('.choose-option-else input[type="radio"]').attr('checked', 'checked');
        $('.choose-option-else').addClass('check');
    });

});




