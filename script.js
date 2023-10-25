const localStorageUser = localStorage.getItem('user');
if (localStorageUser) {
  listUp(localStorageUser);
}

document.querySelector('#search_input').addEventListener('change', async (e) => {
  listUp(e.target.value);
  localStorage.setItem('user', e.target.value);
  e.target.value = null;
});

function link(url) {
  window.location.href = url;
}

async function listUp(user) {
  const profile = document.createElement('div');
  profile.classList.add('profile_container');

  const data = await fetch(`https://api.github.com/users/${user}`).then((res) => res.json());
  const gist_url = data.html_url.replace('github', 'gist.github');
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

  const isAreadyProfile = document.getElementsByClassName('profile_container')[0];

  if (isAreadyProfile) {
    isAreadyProfile.remove();
    document.querySelector('#app').append(profile);
  } else {
    document.querySelector('#app').append(profile);
  }

  const isAreadyRepos = document.getElementsByClassName('repository_container')[0];

  if (isAreadyRepos) {
    isAreadyRepos.remove();
  }

  const repoContainer = document.createElement('div');
  repoContainer.classList.add('repository_container');

  const reposData = await fetch(`${data.repos_url}`).then((res) => res.json());
  reposData.sort((a, b) => {
    return new Date(b.pushed_at) - new Date(a.pushed_at);
  });

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
