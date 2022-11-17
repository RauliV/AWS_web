import dotenv from 'dotenv';
import fetch from 'node-fetch';

// This configures the GIT_TOKEN from .env file in the root of the repo.
// When run in docker compose, there is no need for the configuration.
if (!process.env.AWS_GIT_TOKEN) {
    dotenv.config();
    console.log('Dotenv config done');
}

const gitUrl = 'https://api.github.com/repos/PROJ-A2022-G06-AWS-2-Cloud-Organization/PROJ-A2022-G06-AWS-2-Cloud';
const token = process.env.AWS_GIT_TOKEN;

const headers = {
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${ token}`
};

async function getBranches() {
    const response = await fetch(`${gitUrl }/branches`, {headers: headers});
    const json = await response.json();
    return {'json': json, 'status': response.status, 'statusText': response.statusText};
}

function parseTemplates(branches) {
    const templates = [];
    for (const b of branches) {
        if (b.name.startsWith('TEMPLATE-')) {
            templates.push(b.name);
        }
    }
    return templates;
}

async function getBranchDesc(branch) {
    const url = `${gitUrl }/contents/desc.json?ref=${ branch}`;
    const response = await fetch(url, {headers: headers});
    const json = await response.json();
    return {'json': json, 'status': response.status, 'statusText': response.statusText};
}

async function templateData() {
    const res = (await gitFactory.getBranches());
    const data = {'status': res.status, 'statusText': res.statusText, 'templates': [], 'body': {}};
    if (res.status !== 200) {
        data.body = res.json;
        return data;
    }
    const templates = gitFactory.parseTemplates(await res.json);
    for (const t of templates) {
        const res2 = (await gitFactory.getBranchDesc(t));
        if (res2.status !== 200) {
            data.status = res2.status;
            data.statusText = res2.statusText;
            data.body = res2.json;
            return data;
        }
        const description = JSON.parse(atob(res2.json.content)).description;
        const parameters = JSON.parse(atob(res2.json.content)).parameters;
        data.templates.push({'name': t, 'description': description, 'parameters': parameters});
    }
    return data;
}

export const gitFactory = {
    getBranches,
    parseTemplates,
    getBranchDesc,
    templateData
};