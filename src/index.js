import {EMPTY, fromEvent} from 'rxjs'
import {map, debounceTime, distinctUntilChanged, switchMap, mergeMap, tap, catchError, filter} from 'rxjs/operators'
import {ajax} from 'rxjs/ajax'
import './styles.css'

const userSearchUrl = 'https://api.github.com/search/users?q=';
const repoSearchUrl = 'https://api.github.com/search/repositories?q=';

const userSearch = document.getElementById('userSearch');
const userResult = document.getElementById('userResult');
const repoSearch = document.getElementById('repoSearch');
const repoResult = document.getElementById('repoResult');

const userSearch$ = createStreamFormEvent(userSearch, userResult, userSearchUrl);
const repoSearch$ = createStreamFormEvent(repoSearch, repoResult, repoSearchUrl);

function createStreamFormEvent(element, result, url) {
    return fromEvent(element, 'input')
        .pipe(
            map(e => e.target.value),
            debounceTime(1000),
            distinctUntilChanged(),
            tap(() => result.innerHTML = ''),
            filter(v => v.trim()),
            switchMap(v => ajax.getJSON(url + v)
                .pipe(
                    catchError(err => EMPTY)
                )),
            map(response => response.items),
            mergeMap(items => items)
        );
}

userSearch$.subscribe(user => {
    const userCard = `
    <div class="card">
        <div class="card-image">
            <img src="${user.avatar_url}" />
            <span class="card-title">${user.login}</span>
        </div>
        <div class="card-action">
            <a href="${user.html_url}" target="_blank">Open user profile</a>
        </div>
    </div>
    `;
    userResult.insertAdjacentHTML('beforeend', userCard);
});

repoSearch$.subscribe(repo => {
    const repoCard = `
    <div class="card">
        <div class="card-content">
            <p>${repo.full_name}</p>
        </div>
        <div class="card-action">
            <a href="${repo.html_url}" target="_blank">Open repo</a>
        </div>
    </div>
    `;
    repoResult.insertAdjacentHTML('beforeend', repoCard);
});
