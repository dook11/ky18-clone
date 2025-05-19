/**
 * KY18印刷网站主JavaScript文件
 * 实现网站交互功能
 */

$(document).ready(function() {
    // 初始化
    initializeApp();
    
    // 处理模态框表单切换
    handleModalSwitching();
    
    // 购物车功能
    initializeCart();
    
    // 主题切换功能
    initializeThemeSwitcher();
    
    // 滑块验证功能
    initializeSliderCaptcha();
    
    // 地址解析功能
    initializeAddressParser();
    
    // 首页轮播功能（如果首页轮播存在）
    if ($('.banner-slider').length > 0) {
        $('.banner-slider').slick({
            dots: true,
            arrows: true,
            infinite: true,
            speed: 500,
            fade: true,
            cssEase: 'linear',
            autoplay: true,
            autoplaySpeed: 5000
        });
    }
    
    // 通知栏关闭功能
    $('.top-notice .close').on('click', function() {
        $('.top-notice').slideUp();
    });
    
    // 特性卡片动画效果
    $('.feature-item').hover(
        function() {
            $(this).addClass('shadow-sm');
        },
        function() {
            $(this).removeClass('shadow-sm');
        }
    );
});

/**
 * 初始化应用
 */
function initializeApp() {
    console.log('KY18印刷网站初始化...');
    
    // 下拉菜单交互
    $('.dropdown-toggle').on('click', function(e) {
        e.preventDefault();
        $(this).parent().toggleClass('show');
        $(this).next('.dropdown-menu').toggleClass('show');
    });
    
    // 点击其他地方关闭下拉菜单
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.dropdown').length) {
            $('.dropdown-menu').removeClass('show');
            $('.dropdown').removeClass('show');
        }
    });
    
    // 产品卡片交互
    $('.product-card').hover(
        function() {
            $(this).addClass('shadow-sm');
        },
        function() {
            $(this).removeClass('shadow-sm');
        }
    );
    
    // 产品详情页图片缩略图切换
    if ($('.product-thumbs').length > 0) {
        $('.product-thumbs img').on('click', function() {
            $('.product-thumbs img').removeClass('active');
            $(this).addClass('active');
            $('.main-image').attr('src', $(this).attr('src'));
        });
    }
    
    // 加入购物车按钮
    $('.product-actions .btn-success').on('click', function() {
        // 获取产品信息
        const productCard = $(this).closest('.product-card');
        const productName = productCard.find('h5').text();
        const productPrice = 120; // 实际应用中应从数据中获取
        
        // 添加到购物车
        addToCart({
            name: productName,
            price: productPrice,
            quantity: 1
        });
        
        // 显示通知
        showNotification('已添加到购物车');
    });
    
    // 计算价格按钮（产品详情页）
    $('#calculate-price').on('click', function() {
        if ($(this).length > 0) {
            calculateProductPrice();
        }
    });
}

/**
 * 处理模态框之间的切换
 */
function handleModalSwitching() {
    $('.switch-form').on('click', function(e) {
        e.preventDefault();
        const targetModal = $(this).data('target');
        
        // 隐藏当前模态框，显示目标模态框
        $(this).closest('.modal').modal('hide');
        $(targetModal).modal('show');
    });
}

/**
 * 初始化购物车功能
 */
function initializeCart() {
    // 从本地存储加载购物车
    loadCart();
    
    // 购物车按钮点击
    $('.cart-link').on('click', function() {
        updateCartModal();
    });
    
    // 更新购物车按钮
    $('#cartModal .btn-primary').on('click', function() {
        // 跳转到结算页面
        window.location.href = 'checkout.html';
    });
}

/**
 * 从本地存储加载购物车
 */
function loadCart() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    updateCartCount(cartItems.length);
}

/**
 * 更新购物车计数
 */
function updateCartCount(count) {
    $('.cart-count').text(count);
}

/**
 * 更新购物车模态框内容
 */
function updateCartModal() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartBody = $('#cartModal .modal-body');
    
    if (cartItems.length === 0) {
        // 购物车为空
        cartBody.html(`
            <div class="cart-empty text-center">
                <i class="fa fa-shopping-cart fa-5x"></i>
                <p>购物车空空如也！！</p>
            </div>
        `);
    } else {
        // 显示购物车项目
        let cartHTML = '<div class="cart-items">';
        cartHTML += '<table class="table">';
        cartHTML += '<thead><tr><th>商品</th><th>单价</th><th>数量</th><th>小计</th><th>操作</th></tr></thead>';
        cartHTML += '<tbody>';
        
        cartItems.forEach((item, index) => {
            cartHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>¥${item.price.toFixed(2)}</td>
                    <td>
                        <div class="input-group input-group-sm">
                            <div class="input-group-prepend">
                                <button class="btn btn-outline-secondary decrease-qty" data-index="${index}">-</button>
                            </div>
                            <input type="text" class="form-control text-center item-qty" value="${item.quantity}" readonly>
                            <div class="input-group-append">
                                <button class="btn btn-outline-secondary increase-qty" data-index="${index}">+</button>
                            </div>
                        </div>
                    </td>
                    <td>¥${(item.price * item.quantity).toFixed(2)}</td>
                    <td><button class="btn btn-sm btn-danger remove-item" data-index="${index}">删除</button></td>
                </tr>
            `;
        });
        
        cartHTML += '</tbody></table>';
        cartHTML += '</div>';
        
        cartBody.html(cartHTML);
        
        // 绑定购物车项目事件
        bindCartEvents();
    }
}

/**
 * 绑定购物车事件
 */
function bindCartEvents() {
    // 增加数量
    $('.increase-qty').on('click', function() {
        const index = $(this).data('index');
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        
        if (index >= 0 && index < cartItems.length) {
            cartItems[index].quantity++;
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            updateCartModal();
        }
    });
    
    // 减少数量
    $('.decrease-qty').on('click', function() {
        const index = $(this).data('index');
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        
        if (index >= 0 && index < cartItems.length) {
            if (cartItems[index].quantity > 1) {
                cartItems[index].quantity--;
                localStorage.setItem('cartItems', JSON.stringify(cartItems));
                updateCartModal();
            }
        }
    });
    
    // 删除商品
    $('.remove-item').on('click', function() {
        const index = $(this).data('index');
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        
        if (index >= 0 && index < cartItems.length) {
            cartItems.splice(index, 1);
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            updateCartCount(cartItems.length);
            updateCartModal();
        }
    });
}

/**
 * 添加商品到购物车
 */
function addToCart(item) {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // 检查商品是否已存在于购物车
    const existingItemIndex = cartItems.findIndex(cartItem => cartItem.name === item.name);
    
    if (existingItemIndex >= 0) {
        // 如果已存在，增加数量
        cartItems[existingItemIndex].quantity += item.quantity;
    } else {
        // 如果不存在，添加新商品
        cartItems.push(item);
    }
    
    // 保存到本地存储
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // 更新购物车计数
    updateCartCount(cartItems.length);
}

/**
 * 初始化主题切换
 */
function initializeThemeSwitcher() {
    // 检查本地存储中的主题设置
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        $('body').addClass('dark-theme');
    }
    
    // 主题切换器点击事件
    $('.theme-option span').on('click', function() {
        const isDark = $(this).text().trim() === 'Dark Mode';
        
        if (isDark) {
            $('body').addClass('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            $('body').removeClass('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    });
}

/**
 * 产品价格计算（产品详情页）
 */
function calculateProductPrice() {
    // 模拟价格计算，实际应用中应调用后端API
    const paper = $('input[name="paper"]:checked').parent().text().trim();
    const size = $('input[name="size"]:checked').parent().text().trim();
    const craft = $('input[name="craft"]:checked').parent().text().trim();
    const quantity = parseInt($('#qty').val());
    
    let basePrice = 0;
    
    // 根据纸张类型设置基础价格
    if (paper.includes('157g')) basePrice = 0.8;
    else if (paper.includes('200g')) basePrice = 1.0;
    else if (paper.includes('250g')) basePrice = 1.2;
    else if (paper.includes('300g')) basePrice = 1.5;
    
    // 根据尺寸调整价格
    if (size.includes('A5')) basePrice *= 0.7;
    else if (size.includes('A3')) basePrice *= 1.8;
    else if (size.includes('自定义')) basePrice *= 1.5;
    
    // 根据工艺调整价格
    if (craft.includes('双面彩印')) basePrice *= 1.6;
    else if (craft.includes('单面黑白')) basePrice *= 0.7;
    else if (craft.includes('双面黑白')) basePrice *= 1.2;
    
    // 根据数量调整总价
    let totalPrice = basePrice * quantity;
    
    // 数量折扣
    if (quantity >= 500) totalPrice *= 0.9;
    else if (quantity >= 200) totalPrice *= 0.95;
    
    // 更新显示
    $('.total-price').text('¥' + totalPrice.toFixed(2));
    $('p:contains("单价")').text('单价: ¥' + basePrice.toFixed(2) + '/张');
}

/**
 * 初始化滑块验证
 */
function initializeSliderCaptcha() {
    const sliderButton = $('.slider-button');
    const sliderTrack = $('.slider-track');
    
    let isDragging = false;
    let startX = 0;
    let buttonLeft = 0;
    
    sliderButton.on('mousedown touchstart', function(e) {
        isDragging = true;
        startX = e.type === 'mousedown' ? e.pageX : e.originalEvent.touches[0].pageX;
        buttonLeft = parseInt(sliderButton.css('left'));
        e.preventDefault();
    });
    
    $(document).on('mousemove touchmove', function(e) {
        if (!isDragging) return;
        
        const x = e.type === 'mousemove' ? e.pageX : e.originalEvent.touches[0].pageX;
        const moveX = x - startX;
        
        let newLeft = buttonLeft + moveX;
        const maxLeft = sliderTrack.width() - sliderButton.width();
        
        // 限制滑块在轨道内
        if (newLeft < 0) newLeft = 0;
        if (newLeft > maxLeft) newLeft = maxLeft;
        
        sliderButton.css('left', newLeft + 'px');
        
        // 验证成功判断
        if (newLeft >= maxLeft - 5) {
            completeVerification();
        }
    });
    
    $(document).on('mouseup touchend', function() {
        if (isDragging) {
            isDragging = false;
            
            // 验证失败，滑块返回起点
            const currentLeft = parseInt(sliderButton.css('left'));
            if (currentLeft < sliderTrack.width() - sliderButton.width() - 5) {
                sliderButton.animate({left: 0}, 200);
            }
        }
    });
}

/**
 * 完成验证
 */
function completeVerification() {
    $('.slider-button').css('background-color', '#5cb85c').html('<i class="fa fa-check"></i>');
    $('.slider-track').css('background-color', '#dff0d8');
    
    // 实际应用中应该在这里通知后端验证通过
    setTimeout(function() {
        $('.slider-captcha').fadeOut();
    }, 1000);
}

/**
 * 初始化地址解析
 */
function initializeAddressParser() {
    // 如果在结算页面
    if ($('#receiverAddress').length > 0) {
        $('#receiverAddress').on('blur', function() {
            const addressText = $(this).val();
            if (addressText.length > 10) {
                const parsedAddress = parseAddress(addressText);
                
                // 如果成功解析出收件人和电话，自动填充
                if (parsedAddress.name && $('#receiverName').val() === '') {
                    $('#receiverName').val(parsedAddress.name);
                }
                
                if (parsedAddress.phone && $('#receiverPhone').val() === '') {
                    $('#receiverPhone').val(parsedAddress.phone);
                }
            }
        });
    }
}

/**
 * 解析地址文本，提取姓名和电话号码
 */
function parseAddress(addressText) {
    const result = {
        name: '',
        phone: ''
    };
    
    // 手机号码正则
    const phoneRegex = /1[3-9]\d{9}/g;
    const phoneMatch = addressText.match(phoneRegex);
    if (phoneMatch) {
        result.phone = phoneMatch[0];
    }
    
    // 姓名提取（假设姓名在手机号前后，并且是2-4个中文字符）
    const nameRegex = /[\u4e00-\u9fa5]{2,4}/g;
    const nameMatches = addressText.match(nameRegex);
    if (nameMatches && nameMatches.length > 0) {
        // 取第一个匹配结果作为姓名
        result.name = nameMatches[0];
    }
    
    return result;
}

/**
 * 显示通知
 */
function showNotification(message) {
    // 检查是否已存在通知元素
    let notification = $('.notification');
    if (notification.length === 0) {
        notification = $('<div class="notification"></div>');
        $('body').append(notification);
    }
    
    // 设置消息并显示
    notification.text(message).addClass('show');
    
    // 2秒后隐藏
    setTimeout(function() {
        notification.removeClass('show');
    }, 2000);
}

// 添加自定义通知样式
$('<style>')
    .prop('type', 'text/css')
    .html(`
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 2000;
            max-width: 300px;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s;
        }
        .notification.show {
            opacity: 1;
            transform: translateY(0);
        }
        .notification-content {
            background-color: #343a40;
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
    `)
    .appendTo('head'); 