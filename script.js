// 이전 검색기록으로 로드
const localStorageUser = localStorage.getItem('user');
if (localStorageUser) {
  listUp(localStorageUser);
}

// 검색
document.querySelector('#search_input').addEventListener('change', async (e) => {
  listUp(e.target.value);

  localStorage.setItem('user', e.target.value);
  e.target.value = null;
});

function link(url) {
  window.location.href = url;
}

async function eventsLoader(user) {
  const eventsData = [];
  let i = 1;
  while (true) {
    const events = await fetch(`https://api.github.com/users/${user}/events?per_page=100&page=${i}`).then((res) =>
      res.json()
    );
    eventsData.push(...events);
    if (events.length < 100) {
      break;
    }
    i++;
  }
  return eventsData;
}

async function splitedAllDay(days) {
  let answer = [];
  let i = 0;
  let startMonth = new Date(days[0]).getMonth();
  while (days.length > 0) {
    if (startMonth == new Date(days[0]).getMonth()) {
      if (!answer[i]) {
        answer[i] = [];
        answer[i].push(...days.splice(0, 7));
      } else {
        answer[i].push(...days.splice(0, 7));
      }
    } else {
      i++;
      startMonth = new Date(days[0]).getMonth();
      if (!answer[i]) {
        answer[i] = [];
        answer[i].push(...days.splice(0, 7));
      } else {
        answer[i].push(...days.splice(0, 7));
      }
    }
  }
  return answer;
}

async function listUp(user) {
  // https://api.github.com/users/yangharry/events 커밋내역

  // profile 데이터
  const data = await fetch(`https://api.github.com/users/${user}`).then((res) => res.json());
  const gist_url = data.html_url.replace('github', 'gist.github');

  // events 데이터
  const eventsData = await eventsLoader(user);
  const dates = [];
  for (let i = 0; i < eventsData.length; i++) {
    dates.push(eventsData[i].created_at);
  }

  dates.sort((a, b) => {
    return new Date(a) - new Date(b);
  });

  const firstDay = new Date(dates[0]);

  const startDay = new Date(firstDay.setDate(firstDay.getDate() - firstDay.getDay()));
  const endDay = new Date(dates[dates.length - 1]);

  const dateInterval = Math.ceil((endDay.getTime() - startDay.getTime()) / 1000 / 3600 / 24);

  const contributions = {};

  for (let i = 0; i < dates.length; i++) {
    let month = new Date(dates[i]).getMonth() + 1;
    let date = new Date(dates[i]).getDate();
    if (!contributions[month]) {
      contributions[month] = {};
      contributions[month][date] = 1;
    } else {
      if (!contributions[month][date]) {
        contributions[month][date] = 1;
      } else {
        contributions[month][date]++;
      }
    }
  }

  const allDays = [];

  for (let i = 0; i <= dateInterval; i++) {
    let firstDay = new Date(dates[0]);
    let startDay = new Date(firstDay.setDate(firstDay.getDate() - firstDay.getDay()));
    const day = new Date(startDay.setDate(startDay.getDate() + i)).toISOString();
    allDays.push(day);
  }

  const splitedAllDays = await splitedAllDay(allDays);

  // repos 데이터
  const reposData = await fetch(`${data.repos_url}`).then((res) => res.json());
  reposData.sort((a, b) => {
    return new Date(b.pushed_at) - new Date(a.pushed_at);
  });

  // profile 이미 존재할 겨우 삭제
  const isAreadyProfile = document.getElementsByClassName('profile_container')[0];

  if (isAreadyProfile) {
    isAreadyProfile.remove();
  }

  // contributions 이미 존재할 경우 삭제
  const isAreadyContributions = document.getElementsByClassName('event_container')[0];

  if (isAreadyContributions) {
    isAreadyContributions.remove();
  }
  // repos 이미 존재할 경우 삭제
  const isAreadyRepos = document.getElementsByClassName('repository_container')[0];

  if (isAreadyRepos) {
    isAreadyRepos.remove();
  }

  // profile ui 생성
  const profile = document.createElement('div');
  profile.classList.add('profile_container');

  profile.innerHTML = `<div class="profile_box1">
  <img class="profile_img" src=${data.avatar_url} />
  <div class="profile_btn">
    <button onclick="link('${data.html_url}')">View Profile</button>
  </div>
</div>
<div class="profile_box2">
  <div class="profile_tag">
    <button class="repos" onclick="link('${data.html_url}?tab=repositories')">Public Repos: ${data.public_repos}</button>
    <button class="gists" onclick="link('${gist_url}')">Public Gists: ${data.public_gists}</button>
    <button class="followers" onclick="link('${data.html_url}?tab=followers')">Followers: ${data.followers}</button>
    <button class="following" onclick="link('${data.html_url}?tab=following')">Following: ${data.following}</button>
  </div>
  <div class="profile_content">
    <table>
      <tr>
        <td>Company: ${data.company}</td>
      </tr>
      <tr>
        <td>Email: ${data.email}</td>
      </tr>
      <tr>
        <td>Blog: ${data.blog}</td>
      </tr>
      <tr>
        <td>Location: ${data.location}</td>
      </tr>
      <tr>
        <td>Member Since: ${data.created_at}</td>
      </tr>
    </table>
  </div>
</div>`;

  document.querySelector('#app').append(profile);

  // events 생성
  const eventContainer = document.createElement('div');
  eventContainer.classList.add('event_container');

  eventContainer.innerHTML = `<div class="event_title">Contributions</div>
  <div class="event_table"><table>
  <tr id="Month">
    <td class="date"></td>
  </tr>
  <tr id="Sun">
    <td class="date">Sun</td>
  </tr>
  <tr id="Mon">
    <td class="date">Mon</td>
  </tr>
  <tr id="Tue">
  <td class="date">Tue</td>
</tr>
  <tr id="Wed">
    <td class="date">Wed</td>
  </tr>
  <tr id="Thu">
    <td class="date">Thu</td>
  </tr>
  <tr id="Fri">
    <td class="date">Fri</td>
  </tr>
  <tr id="Sat">
    <td class="date">Sat</td>
  </tr>

</table></div>`;

  document.querySelector('#app').append(eventContainer);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 0; i < splitedAllDays.length; i++) {
    const month = document.createElement('td');
    const monthName = monthNames[new Date(splitedAllDays[i][0]).getMonth()];
    const colspan = Math.ceil(splitedAllDays[i].length / 7);
    month.classList.add('date');
    month.id = monthName;
    month.colSpan = colspan;
    month.innerHTML = monthName;

    document.querySelector('#Month').append(month);

    for (let j = 0; j < splitedAllDays[i].length; j++) {
      const day = document.createElement('td');
      const dayName = dayNames[new Date(splitedAllDays[i][j]).getDay()];
      const mon = new Date(splitedAllDays[i][j]).getMonth() + 1;
      const date = new Date(splitedAllDays[i][j]).getDate();
      if (contributions[mon][date] >= 9) {
        day.classList.add('more_nine');
      } else if (contributions[mon][date] >= 6) {
        day.classList.add('less_nine');
      } else if (contributions[mon][date] >= 3) {
        day.classList.add('less_six');
      } else if (contributions[mon][date] >= 1) {
        day.classList.add('less_three');
      } else {
        day.classList.add('no_commit');
      }
      document.querySelector(`#${dayName}`).append(day);
    }
  }

  // repos ui 생성
  const repoContainer = document.createElement('div');
  repoContainer.classList.add('repository_container');

  repoContainer.innerHTML = `<div class="repository_title">Repository</div>`;
  document.querySelector('#app').append(repoContainer);

  for (let i = 0; i < reposData.length; i++) {
    const repos = document.createElement('div');
    repos.classList.add('repository');
    repos.innerHTML = `
    <div class="repository_name"><a href=${reposData[i].html_url}>${reposData[i].name}</a></div>
    <div class="repository_tag">
      <button class="stars" onclick="link('${reposData[i].html_url}/stargazers')">Starts: ${reposData[i].stargazers_count}</button>
      <button class="watchers" onclick="link('${reposData[i].html_url}/watchers')">Watchers: ${reposData[i].watchers_count}</button>
      <button class="forks" onclick="link('${reposData[i].html_url}/forks')">Forks: ${reposData[i].forks_count}</button>
    </div>
  `;

    document.querySelector('.repository_container').append(repos);
  }
}
