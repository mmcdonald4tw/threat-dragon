import github from 'octonode';

import env from '../env/Env.js';

const getClient = (accessToken) => {
    const enterpriseHostname = env.get().config.GITHUB_ENTERPRISE_HOSTNAME;
    if (enterpriseHostname) {
        const port = env.get().config.GITHUB_ENTERPRISE_PORT;
        const protocol = env.get().config.GITHUB_ENTERPRISE_PROTOCOL;
        const enterpriseOpts = { hostname: `${enterpriseHostname}/api/v3` };
        if (port) { enterpriseOpts.port = parseInt(port, 10); }
        if (protocol) { enterpriseOpts.protocol = protocol; }

        return github.client(accessToken, enterpriseOpts);
    }
    return github.client(accessToken);
};

const reposAsync = (page, accessToken) => getClient(accessToken).me().
reposAsync(page);

const searchAsync = (accessToken, searchQuery) => getClient(accessToken).search()
    .reposAsync({ q: searchQuery });

const userAsync = async (accessToken) => {
    const resp = await getClient(accessToken).me().
infoAsync();
    return resp[0];
};

const branchesAsync = (repoInfo, accessToken) => {
    const client = getClient(accessToken);
    return client.repo(getRepoFullName(repoInfo)).branchesAsync(repoInfo.page);
};

const modelsAsync = (branchInfo, accessToken) => getClient(accessToken).
    repo(getRepoFullName(branchInfo)).
    contentsAsync('ThreatDragonModels', branchInfo.branch);

const modelAsync = (modelInfo, accessToken) => getClient(accessToken).
    repo(getRepoFullName(modelInfo)).
    contentsAsync(getModelPath(modelInfo), modelInfo.branch);

const createAsync = (modelInfo, accessToken) => getClient(accessToken).
    repo(getRepoFullName(modelInfo)).
    createContentsAsync(
        getModelPath(modelInfo),
        'Created by OWASP Threat Dragon',
        getModelContent(modelInfo),
        modelInfo.branch
    );

const updateAsync = async (modelInfo, accessToken) => {
    const original = await modelAsync(modelInfo, accessToken);
    const repo = getRepoFullName(modelInfo);
    const path = getModelPath(modelInfo);
    const modelContent = getModelContent(modelInfo);

    return getClient(accessToken).
        repo(repo).
        updateContentsAsync(
            path,
            'Updated by OWASP Threat Dragon',
            modelContent,
            original[0].sha,
            modelInfo.branch
        );
};

const deleteAsync = async (modelInfo, accessToken) => {
    const content = await modelAsync(modelInfo, accessToken);
    return getClient(accessToken).
        repo(getRepoFullName(modelInfo)).
        deleteContentsAsync(
            getModelPath(modelInfo),
            'Deleted by OWASP Threat Dragon',
            content[0].sha,
            modelInfo.branch
        );
};

const getRepoFullName = (info) => `${info.organisation}/${info.repo}`;
const getModelPath = (modelInfo) => `ThreatDragonModels/${modelInfo.model}/${modelInfo.model}.json`;
const getModelContent = (modelInfo) => JSON.stringify(modelInfo.body, null, '  ');

export default {
    branchesAsync,
    createAsync,
    deleteAsync,
    modelAsync,
    modelsAsync,
    reposAsync,
    searchAsync,
    updateAsync,
    userAsync
};
