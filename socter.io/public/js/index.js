/* 
  1. 连接socketio服务
*/
var socket = io('http://localhost:3000')
var username, avatar

/* 
  2. 用户头像选择功能
    给用户头像注册点击事件，排他
*/
$('.login_box .avatar li').on('click', function() {
    $(this)
        .addClass('now')
        .siblings()
        .removeClass('now')
})
$('#loginBtn').on('click', function() {
    // 获取用户名
    var username = $('#username')
        .val()
        .trim()
    if (!username) return alert('请输入用户名')

    var avatar = $('.login_box .avatar li.now img').attr('src')
        // 触发登录事件
    socket.emit('login', { username: username, avatar: avatar })
    $('#username').val('')
})

// 监听登录失败事件
socket.on('loginError', function() {
    alert('用户名存在')
})

// 监听登录成功事件
socket.on('loginSuccess', function(data) {
    // 隐藏登录框
    // 显示对话框
    $('.login_box').fadeOut()
    $('.container').fadeIn()

    // 显示用户信息
    $('.header .avatar img').attr('src', data.avatar)
    $('.header .username').text(data.username)

    username = data.username
    avatar = data.avatar
})

// 监听系统消息, 添加一条系统消息
socket.on('addUser', data => {
    $('.box-bd')
        .append(
            `
    <div class="system">
      <p class="message_system">
        <span class="content">${data.username}加入了群聊</span>
      </p>
    </div>
  `
        )
        .children(':last')
        .get(0)
        .scrollIntoView(false)
})

// 登录的时候，用户列表数据在发生改变
socket.on('userList', data => {
    console.log(data)
        // 动态渲染左侧列表
    $('.user-list ul').html('')
    data.forEach(item => {
        $('.user-list ul').append(`
       <li class="user">
          <div class="avatar"><img src="${item.avatar}" alt="" /></div>
          <div class="name">${item.username}</div>
        </li>
    `)
    })

    // 修改群聊人数
    $('.box-hd span').text(data.length)
})

// 聊天功能
$('#btn-send').on('click', function() {
    // 获取聊天的内容
    var content = $('#content').html()
    $('#content').html('')
    if (!content) return alert('请输入聊天内容')

    // 发送给socket服务器
    socket.emit('chatMessage', {
        username: username,
        avatar: avatar,
        msg: content
    })
})

// 接收聊天消息
socket.on('receiveMessage', data => {
    console.log(data)
        // 判断消息是否是自己发送的
    if (data.username === username) {
        // 自己发送的消息
        $('.box-bd').append(`
      <div class="message-box">
        <div class="my message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">${data.msg}</div>
            </div>
          </div>
        </div>
      </div>
    `)
    } else {
        $('.box-bd').append(`
      <div class="message-box">
        <div class="other message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="nickname">${data.username}</div>
            <div class="bubble">
              <div class="bubble_cont">${data.msg}</div>
            </div>
          </div>
        </div>
      </div>    
    `)
    }

    $('.box-bd')
        .children(':last')
        .get(0)
        .scrollIntoView(false)
})

// 接受退出消息的请求
socket.on('delUser', data => {
    $('.box-bd')
        .append(
            `
    <div class="system">
      <p class="message_system">
        <span class="content">${data.username}退出了群聊</span>
      </p>
    </div>
  `
        )
        .children(':last')
        .get(0)
        .scrollIntoView(false)
})

// 发送图片功能
$('#file').on('change', function() {
    // 获取到该图片
    var file = this.files[0]
    var fr = new FileReader()
    fr.readAsDataURL(file)
    fr.onload = function() {
        socket.emit('sendImage', {
            username: username,
            avatar: avatar,
            img: fr.result
        })
    }
})

// 接收聊天图片
socket.on('receiveImage', data => {
    // 判断消息是否是自己发送的
    if (data.username === username) {
        // 自己发送的消息
        $('.box-bd').append(`
      <div class="message-box">
        <div class="my message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">
                <img src="${data.img}">
              </div>
            </div>
          </div>
        </div>
      </div>
    `)
    } else {
        $('.box-bd').append(`
      <div class="message-box">
        <div class="other message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="nickname">${data.username}</div>
            <div class="bubble">
              <div class="bubble_cont">
                <img src="${data.img}">
              </div>
            </div>
          </div>
        </div>
      </div>    
    `)
    }

    // 滚动到底部
    $('.box-bd img:last').load(function() {
        $('.message-box:last')
            .get(0)
            .scrollIntoView(false, {
                behavior: 'smooth'
            })
    })
})

// 表情功能
$('.face').on('click', function() {
    $('#content').emoji({
        button: '.face',
        position: 'topRight',
        showTab: true,
        animation: 'fade',
        icons: [{
            name: 'qq表情',
            path: '../lib/jquery-emoji/img/qq/',
            maxNum: 91,
            excludeNums: [41, 45, 54],
            file: '.gif',
            placeholder: '#qq_{alias}#'
        }]
    })
})