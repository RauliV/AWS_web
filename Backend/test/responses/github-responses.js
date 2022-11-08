const OkBranchDesc1 = {
    json: {
      content: 'ewoJImRlc2NyaXB0aW9uIjogIlRoaXMgaXMgdGhlIGRlc2NyaXB0aW9uIG9m\n' +
        'IENESyBhcHBsaWNhdGlvbiB0ZW1wbGF0ZSBuYW1lZCBUZXN0MS4iCn0K\n'
    },
    status: 200,
    statusText: 'OK'
};

const OkBranchDesc2 = {
    json: {
      content: 'ewoJImRlc2NyaXB0aW9uIjogIlRoaXMgaXMgc29tZSBkZXNjcmlwdGlvbiBm\n' +
      'b3IgVGVzdDIgdGVtcGxhdGUiCn0K\n'
    },
    status: 200,
    statusText: 'OK'
};

const NotOkBranchDesc = {
    json: {
      message: 'No commit found for the ref undefined',
      documentation_url: 'https://docs.github.com/v3/repos/contents/'
    },
    status: 404,
    statusText: 'Not Found'
};

const OkBranchesResponse = {
    json: [
        {
        name: '35-bugfix-for-workflow',
        },
        {
        name: '35-initial-deployment-of-ec2-instance-done-from-github-actions-to-aws',
        },
        {
        name: '39-update-readmemd-to-include-workflow-run-instructions-for-iac-deployement',    
        },
        { name: 'TEMPLATE-Test1',},
        { name: 'TEMPLATE-Test2',},
        {
        name: 'add-static-code-analysis',
        },
        { name: 'main',}
    ],
    status: 200,
    statusText: 'OK'
};

const notOkBranchesResponse = {
    json: {
        'message': 'Not Found',
        'documentation_url': 'https://docs.github.com/rest'
    },
    status: 404,
    statusText: 'Not Found'
};

export const githubResponses = {
  notOkBranchesResponse,
  OkBranchesResponse,
  NotOkBranchDesc,
  OkBranchDesc1,
  OkBranchDesc2
};