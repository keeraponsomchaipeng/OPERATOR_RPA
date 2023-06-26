import axios, { AxiosResponse } from 'axios';

const options = [
  {
    value: 'CAMUNDA_CLOUD_RPA_TEST',
    label: 'CAMUNDA_CLOUD_RPA_TEST',
  },
  {
    value: 'DEMO_webapp_RPA',
    label: 'DEMO_webapp_RPA',
  },
  {
    value: 'Selenium_flow',
    label: 'Selenium_flow',
  },
  {
    value: 'advance_sharepoint',
    label: 'advance_sharepoint',
  },
  {
    value: 'Testone_more_flow',
    label: 'Testone_more_flow',
  },
];

const valuesList = options.map((option) => option.value);

interface Post {
  bpmnid: string[];
}

const postData: Post = {
  bpmnid: valuesList,
};

interface DictionaryResponse {
  [key: string]: string;
}
let x: DictionaryResponse = {};

axios.post('http://localhost:8000/process/', postData)
  .then((response: AxiosResponse) => {
    x = response.data;
  })
  .catch((error: Error) => {
    console.log(error);
  });

export { x };
