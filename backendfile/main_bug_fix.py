import requests
import json
import datetime
import base64
import xmltodict
import logging
import grpc
from zeebe_grpc import gateway_pb2, gateway_pb2_grpc
import pandas as pd
import authentication as auth


def process(payload):
    url = "http://localhost:9200/zeebe-record_process_*/_search"
    data = {
    "size": 0,
      "query": {
    "bool": {
      "filter": {
        "terms": {
          "value.bpmnProcessId": payload
        }
      }
    }
  },
    "aggs": {
        "by_bpmnProcessId": {
            "terms": {
                "field": "value.bpmnProcessId",
                "size": 100
            },
            "aggs": {
                "top_docs_max_version": {
                    "top_hits": {
                        "sort": [
                            {
                                "value.version": {
                                    "order": "desc"
                                }
                            }
                        ],
                        "size": 1
                    }
                }
            }
        }
    }
}
    response = requests.post(url, json=data)
    return response.json()



def main_kub(listdept):
    dict_bpmn_xhtml = bpmndict()
    # url = "http://10.182.37.125:9200/zeebe-record_job_8.0.0_*/_search"
    url = "http://localhost:9200/zeebe-record_job_*/_search"

    data = {
    "size": 0,
    "query": {
        "bool": {
        "filter": {
            "terms": {
            "value.bpmnProcessId": listdept
            }
        }
        }
    },
    "aggs": {
    "by_processInstanceKey": {
        "terms": {
        "field": "value.processInstanceKey",
        "size": 1000,
        "order": {
                "min_dateTime": "desc"
            }
        },
        "aggs": {
        "max_dateTime": {
            "max": {
            "field": "timestamp"
            }
        },
        "min_dateTime": {
            "min": {
            "field": "timestamp"
            }
        },
        "top_docs_max_dateTime": {
            "top_hits": {
            "sort": [
                {
                "timestamp": {
                    "order": "desc"
                }
                }
            ],
            "size": 1
            }
        }
        }
    }
    }
}

    response = requests.post(url, json=data)
    
    startkey = 0
    data_api = []
    for i in response.json()['aggregations']['by_processInstanceKey']['buckets']:
        for x in i['top_docs_max_dateTime']['hits']['hits']:
            if x['_source']['intent'] == "CREATED":
                Endtime = "--"
                Current_Instance_Status = "Active"
            else :
                Endtime = i['max_dateTime']['value_as_string']
                Current_Instance_Status = x['_source']['intent']
            if dict_bpmn_xhtml.get(x['_source']['value']['bpmnProcessId']) != None:
                xml = dict_bpmn_xhtml[x['_source']['value']['bpmnProcessId']]
            else:
                xml = ""
            data_api.append({
                "key": startkey,
                "BpmnProcessID":x['_source']['value']['bpmnProcessId'],
                "ProcessInstanceKey":x['_source']['value']['processInstanceKey'],
                "Current_Process_ID":x['_source']['value']['elementId'],
                "Current_Instance_Status":Current_Instance_Status,
                "Starttime":i['min_dateTime']['value_as_string'],
                "Endtime":Endtime,
                "xhtml": xml
            })
            startkey += 1
    return data_api

def track_all_process(listdept):
    # url = "http://10.182.37.125:9200/zeebe-record_job_8.0.0_*/_search"
    url = "http://localhost:9200/zeebe-record_job_*/_search"

    data = {
    "size": 0,
    "query": {
        "bool": {
        "filter": {
            "terms": {
            "value.bpmnProcessId": listdept
            }
        }
        }
    },
    "aggs": {
    "by_processInstanceKey": {
        "terms": {
        "field": "value.processInstanceKey",
        "size": 1000,
        "order": {
                "min_dateTime": "desc"
            }
        },
        "aggs": {
        "max_dateTime": {
            "max": {
            "field": "timestamp"
            }
        },
        "min_dateTime": {
            "min": {
            "field": "timestamp"
            }
        },
        "top_docs_max_dateTime": {
            "top_hits": {
            "sort": [
                {
                "timestamp": {
                    "order": "desc"
                }
                }
            ],
            "size": 1
            }
        }
        }
    }
    }
}
    distinct_all_elementid = []
    dict_element_vs_status = []
    response = requests.post(url, json=data)
    data = response.json()['aggregations']['by_processInstanceKey']['buckets']
    for i in data:
      for x in i['top_docs_max_dateTime']['hits']['hits']:
        if x['_source']['intent'] == "CREATED":
          intent = "Active"
        else:
          intent = x['_source']['intent']
        distinct_all_elementid.append(x['_source']['value']['elementId'])
        dict_element_vs_status.append({x['_source']['value']['elementId'] : intent})
    result = {}

    for item in dict_element_vs_status:
        task_name = list(item.keys())[0]
        status = item[task_name]
        
        if task_name in result:
            result[task_name][status] = result[task_name].get(status, 0) + 1
        else:
            result[task_name] = {status: 1}

    formatted_result = [{task_name: {status: count}} for task_name, statuses in result.items() for status, count in statuses.items()]
    return formatted_result

def Active_process_check(bpmnprocess):
    url = "http://localhost:9200/zeebe-record_job_*/_search"

    data = {
    "size": 0,
    "query": {
        "bool": {
            "filter": {
                "term": {
                    "value.bpmnProcessId": bpmnprocess
                }
            }
        }
    },
    "aggs": {
        "by_processInstanceKey": {
            "terms": {
                "field": "value.processInstanceKey",
                "size": 30000,
                "order": {
                    "min_dateTime": "desc"
                }
            },
            "aggs": {
                "max_dateTime": {
                    "max": {
                        "field": "timestamp"
                    }
                },
                "min_dateTime": {
                    "min": {
                        "field": "timestamp"
                    }
                },
                "top_docs_max_dateTime": {
                    "top_hits": {
                        "sort": [
                            {
                                "timestamp": {
                                    "order": "desc"
                                }
                            }
                        ],
                        "size": 1
                    }
                }
            }
        }
    }
}


    data_check = []
    startkey = 1
    response = requests.post(url, json=data)  
    for i in response.json()['aggregations']['by_processInstanceKey']['buckets']:
        for x in i['top_docs_max_dateTime']['hits']['hits']:
            if x['_source']['intent'] == "CREATED":
                data_check.append({
                "key": startkey,
                "BpmnProcessID":x['_source']['value']['bpmnProcessId'],
                "ProcessInstanceKey":x['_source']['value']['processInstanceKey'],
                "Current_Process_ID":x['_source']['value']['elementId'],
            })
            ### ทำเผื่อเอาไว้ ส่ง Url sharepoint ผ่าน Variables
            # elif x['_source']['intent'] == "COMPLETED":
            #     data_check.append({
            #     "key": startkey,
            #     "BpmnProcessID":x['_source']['value']['bpmnProcessId'],
            #     "ProcessInstanceKey":x['_source']['value']['processInstanceKey'],
            #     "Current_Process_ID":x['_source']['value']['elementId'],
            #     "variables":x['_source']['value']['variables'],
            # })
            startkey += 1
    return data_check 

#create dictionary bpmn vs xml
def bpmndict():
    url = "http://localhost:9200/zeebe-record_process_*/_search"
    data = {
        "size": 0,
        "aggs": {
            "by_bpmnProcessId": {
                "terms": {
                    "field": "value.bpmnProcessId",
                    "size": 100
                },
                "aggs": {
                    "top_docs_max_version": {
                        "top_hits": {
                            "sort": [
                                {
                                    "value.version": {
                                        "order": "desc"
                                    }
                                }
                            ],
                            "size": 1
                        }
                    }
                }
            }
        }
    }
    xhtml = []
    bpmnProcessId = []
    response = requests.post(url, json=data)
    for i in response.json()['aggregations']['by_bpmnProcessId']['buckets']:
        for x in i['top_docs_max_version']['hits']['hits']:
            bpmnProcessId.append(x['_source']['value']['bpmnProcessId'])
            try:
                xhtml.append(x['_source']['value']['resource'])
            except:
                print("ERROR อะไรก็ไม่รู้ งงมาก")
                xhtml.append("")

    dict_bpmn_xhtml = dict(zip(bpmnProcessId, xhtml))
    return dict_bpmn_xhtml
        

# print(main_kub())
def dashboard():
    url = "http://localhost:9200/zeebe-record_job_*/_search"

    data = {
        "size": 0,
        "aggs": {
            "by_processInstanceKey": {
                "terms": {
                    "field": "value.processInstanceKey",
                    "size": 100000,
                    "order": {
                        "min_dateTime": "desc"
                    }
                },
                "aggs": {
                    "max_dateTime": {
                        "max": {
                            "field": "timestamp"
                        }
                    },
                    "min_dateTime": {
                        "min": {
                            "field": "timestamp"
                        }
                    },
                    "top_docs_max_dateTime": {
                        "top_hits": {
                            "sort": [
                                {
                                    "key": {
                                        "order": "desc"
                                    }
                                }
                            ],
                            "size": 1
                        }
                    }
                }
            }
        }
    }

    response = requests.post(url, json=data)
    data_created = []

    for i in response.json()['aggregations']['by_processInstanceKey']['buckets']:
        for x in i['top_docs_max_dateTime']['hits']['hits']:
            if x['_source']['intent'] != "COMPLETED" and x['_source']['intent'] != "CANCELED":
                data_created.append(i)

    data_api = []
    startkey = 0
    for z in data_created:
        for x in z['top_docs_max_dateTime']['hits']['hits']:
            if x['_source']['intent'] == "CREATED":
                Current_Instance_Status = "Active"
            else:
                Current_Instance_Status = x['_source']['intent']
            data_api.append({
                "BpmnProcessID": x['_source']['value']['bpmnProcessId'],
                "ProcessInstanceKey": x['_source']['value']['processInstanceKey'],
                "Current_Process_ID": x['_source']['value']['elementId'],
                "Current_Instance_Status": Current_Instance_Status,
            })

    df = pd.DataFrame(data_api)

    # Set the categories to include all possible values
    categories = ['FAILED', 'Active']  # Add other possible values if applicable
    df['Current_Instance_Status'] = pd.Categorical(df['Current_Instance_Status'], categories=categories)

    grouped_df = df.groupby(["BpmnProcessID", "Current_Instance_Status"]).size().reset_index(name='Count')
    # print(grouped_df)

    # Convert to JSON format
    json_data = grouped_df.to_dict(orient='records')
    return json_data


from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
origins = ["*"] # Change the * to the domain name of your frontend server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# json_output = json.dumps(data, indent=4) << for check data
@app.get("/")
async def get_data():
    data = {"message":"Hello RPA API"}
    # print(data)
    return JSONResponse(content=data)

@app.get("/dashboard/")
async def get_dashboard():
    data = dashboard()
    return JSONResponse(content=data)
    
class cancelprocess(BaseModel):
    Processinstance: int
    
from pyzeebe import ZeebeClient, create_insecure_channel
@app.post("/cancel/")
async def process_data_query(payload:cancelprocess):
        channel = create_insecure_channel(hostname="localhost", port=26500)
        zeebe_client = ZeebeClient(channel)
        # Cancel a running process
        await zeebe_client.cancel_process_instance(process_instance_key=payload.Processinstance)
        print("done cancel process")
        return JSONResponse(content={"message":"Process " + str(payload.Processinstance) + " was cancelled."})
    

@app.get("/process/")
async def process_data():
    data_api = main_kub(auth.process_auth("24shopping"))
    return JSONResponse(content=data_api)

class process_post(BaseModel):
    dept: str
    
@app.post("/processs/")
async def process_data_post(payload:process_post):
    data_api = main_kub(auth.process_auth(payload.dept))
    return JSONResponse(content=data_api)

class runprocess(BaseModel):
    bpmnid: list

@app.post("/process/")
async def process_data_query(payload:runprocess):
    response = process(payload.bpmnid)

    dictionary = {
        x['_source']['value']['bpmnProcessId']: x['_source']['value']['resource']
        for i in response['aggregations']['by_bpmnProcessId']['buckets']
        for x in i['top_docs_max_version']['hits']['hits']
    }

    # return JSONResponse(content=data_api)
    return JSONResponse(content=dictionary)

class runprocess(BaseModel):
    bpmnid: list
@app.post("/trackprocess/")
async def process_data_query(payload:runprocess):
    data = track_all_process(payload.bpmnid)
    print(data)
    return data

class Complete_payload(BaseModel):
    elementInstanceKey : int
    variables : dict
@app.post("/tasklist/complete")
async def complete_usertask(payload:Complete_payload):
    with grpc.insecure_channel("localhost:26500") as channel:
        stub = gateway_pb2_grpc.GatewayStub(channel)

        # start a worker
        activate_jobs_response = stub.ActivateJobs(
            gateway_pb2.ActivateJobsRequest(
                type="io.camunda.zeebe:userTask",
                worker="Python worker",
                timeout=60000,
                maxJobsToActivate=32
            )
        )
        for response in activate_jobs_response:
            for job in response.jobs:
                if job.elementInstanceKey == payload.elementInstanceKey:
                    try:
                        print(job.elementInstanceKey)
                        stub.CompleteJob(gateway_pb2.CompleteJobRequest(jobKey=job.key, variables=json.dumps(payload.variables)))
                        logging.info("Job Completed")
                    except Exception as e:
                        stub.FailJob(gateway_pb2.FailJobRequest(jobKey=job.key))
                        logging.info(f"Job Failed {e}")


                    


def startprocess(bpmn):
    with grpc.insecure_channel("localhost:26500") as channel:
        stub = gateway_pb2_grpc.GatewayStub(channel)

        # print the topology of the zeebe cluster
        topology = stub.Topology(gateway_pb2.TopologyRequest())

        # start a process instance
        variables = {
            "message": "This is a Message"
        }
        stub.CreateProcessInstance(
            gateway_pb2.CreateProcessInstanceRequest(
                bpmnProcessId=bpmn,
                version=-1,
                variables=json.dumps(variables)
            )
        )
class startflow(BaseModel):
    bpmnprocessID_pl : str                 
@app.post("/startflow")
async def Startflow(payload:startflow):
    # with grpc.insecure_channel("10.182.37.125:26500") as channel:
    if payload.bpmnprocessID_pl == "DEMO_webapp_RPA":
        activecheck = Active_process_check(payload.bpmnprocessID_pl)
        if len(activecheck) != 0:
            print("Process already running" + str(activecheck))
        else:
            startprocess(payload.bpmnprocessID_pl)
            print("Start process success" + str(activecheck))
        return activecheck
    else:
        activecheck = Active_process_check(payload.bpmnprocessID_pl)
        startprocess(payload.bpmnprocessID_pl)
        return activecheck


        
@app.post("/checkactiveprocess")
async def checkactiveprocess(payload:startflow):
    activecheck = Active_process_check(payload.bpmnprocessID_pl)
    return activecheck
        

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
