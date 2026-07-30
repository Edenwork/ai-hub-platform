
        $(document).ready(function() {
            // 初始設定為最近 1 小時
            var start = moment().subtract(1, 'hours');
            var end = moment();

            function updateButtonText(start, end, label) {
                // 優化邏輯：如果是「自訂日期」，則顯示日期區間；否則顯示選單標籤
                if (label === '自訂日期') {
                    // 格式化為 2026/02/08 - 2026/03/09
                    $('.reportrange span:first-child').html(start.format('YYYY/MM/DD') + ' - ' + end.format('YYYY/MM/DD'));
                } else {
                    $('.reportrange span:first-child').html(label);
                }
            }

            $('.reportrange').daterangepicker({
                startDate: start,
                endDate: end,
                timePicker: true,           // 支援時間選取
                timePicker24Hour: false,    // AM/PM 制
                alwaysShowCalendars: true,  // 保持日曆開啟
              
                ranges: {
                    '最近 1 小時': [moment().subtract(1, 'hours'), moment()],
                    '最近 30 分鐘': [moment().subtract(30, 'minutes'), moment()],
                    '最近 3 小時': [moment().subtract(3, 'hours'), moment()],
                    '最近 24 小時': [moment().subtract(24, 'hours'), moment()],
                    '最近 7 天': [moment().subtract(6, 'days'), moment()],
                    '最近 30 天': [moment().subtract(29, 'days'), moment()]
                },
                locale: {
                    format: 'YYYY/MM/DD hh:mm A',
                    applyLabel: "Apply",
                    cancelLabel: "Cancel",
                    customRangeLabel: "自訂日期",
                    daysOfWeek: ["日", "一", "二", "三", "四", "五", "六"],
                    monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
                }
            }, updateButtonText); // 綁定更新函數

            // 初始化按鈕文字
            updateButtonText(start, end, '最近 1 小時');
        });

