const baseURL = "https://play.picoctf.org";

const getCookie = cname => {
    const name = `${cname}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i += 1) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function makeFormResult(req, confirmPage) {
    return function () {
        if (req.readyState === XMLHttpRequest.DONE) {
            if (req.status === 200) {
                let success = JSON.parse(req.responseText)['success'];
                if (success) {
                    console.log('form submit: success');
                    window.location = confirmPage;
                    return;
                }
            }
            let reg_button = document.querySelector('.js-button-submit');
            console.log('form submit: failed');
            reg_button.innerHTML = 'Error';
            reg_button.classList.add('error');
        }
    }
}

function ajaxSubmit(event, confirmPage) {
    console.log('form submit');
    event.preventDefault();
    let req = new XMLHttpRequest();
    let form = document.querySelector('form.js-ajaxform');
    req.open('post', form.action);
    req.onreadystatechange = makeFormResult(req, confirmPage);
    req.send(new FormData(form));
    let reg_button = document.querySelector('.js-button-submit');
    reg_button.innerHTML = 'Submitting...';
}


const getPlatformUser = () => {
    return new Promise(async (resolve) => {
        fetch(`${baseURL}/api/user/`, {
            mode: 'cors',
            credentials: 'include'
        }).then(
            response => {
                // Don't reject() to be thrown via await, just fail silently and unset
                if (response.status !== 200) {
                    localStorage.removeItem('picoUser');
                    resolve({});
                }
                response.json().then(data => {
                    localStorage.setItem('picoUser', JSON.stringify(data));
                    resolve((data));
                });
            }
        )
            .catch(() => {
                localStorage.removeItem('picoUser');
                resolve({});
            });
    })
}

function logout() {
    fetch(`${baseURL}/api/user/logout/`, {
        method: 'post',
        body: "{}",
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
    })
        .then(response => {
                if (response.status === 204) {
                    localStorage.removeItem('picoUser');
                    updateUserNav();
                }
            }
        )
        .catch(err => {
            console.log(err);
        });
}

function updateUserNav(user) {
    if (user && user.username) {
        let username = (user.username.length > 10) ? "" : user.username;  // remove name if layout-breaking
        const loggedIn =
            `<li class="my-auto dropdown nav-item" id="userlogin">
                <a aria-expanded="false" aria-haspopup="true" class="compact dropdown-toggle nav-link" data-toggle="dropdown"
                   href="#">
                    <span id="picoUserName">${username}</span>
                    <i class="far fa-user"></i>
                    <b class="caret d-none d-lg-inline d-xl-inline"></b>
                </a>
                <ul aria-hidden="true" class="dropdown-navbar dropdown-menu dropdown-menu-right" role="menu" tabindex="-1">
                    <li><a href="${baseURL}/user-profile">
                        <button class="nav-item dropdown-item" role="menuitem" tabindex="0" type="button">Profile</button>
                    </a></li>
                    <!--
                    <li class="dropdown-divider" tabindex="-1"></li>
                    <li><a href="#logout" onclick="logout()">
                        <button class="nav-item dropdown-item" role="menuitem" tabindex="0" type="button">Log out</button>
                    </a></li>
                    -->
                </ul>
            </li>`;
        $("#userlogin").replaceWith(loggedIn);
        $("#Practice-link").attr("href", `${baseURL}/practice`);
    } else {
        const loggedOut =
            `<li class="nav-item" id="userlogin">
            <a aria-current="page" class="nav-link active" href="${baseURL}/login">Log In</a>
        </li>`;
        $("#userlogin").replaceWith(loggedOut);
        $("#Practice-link").attr("href", '/index.html#picogym');
    }
}

const showHashTab = () => {
    let tabName = document.location.hash;
    let tabEl = $(`${tabName}-tab`);
    if (tabEl.length) {
        tabEl.tab('show');
        tabEl.scrollIntoView();
    }
}

// Replace nav with logged-in links
$(async () => {
    // Defer until challenge subdomain migration is completed and picoctf.org is clean (infrastructure#9)
    /*
    let user = JSON.parse(localStorage.getItem('picoUser'));
    if (user && user.username) {  // Load user from localStorage
        updateUserNav(user);
    }
    let updatedUser = await getPlatformUser();  // Fetch update
    if (JSON.stringify(updatedUser) !== JSON.stringify(user)) {
        updateUserNav(updatedUser); // Update Nav if change is detected in user
    }*/
});
