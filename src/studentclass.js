import React from 'react';
import ReactDOM from 'react-dom';
import './studentclass.css';
import {Row,Col,Button,Card} from'antd'
import {Link} from 'react-router-dom';
import axios from 'axios';
import {_} from 'underscore'
var classRow=[];//课程班显示在网页卡片上的列表
var courseIDrow=[];//学生的课程列表ID，防止重复

class Studentclass extends React.Component{
    render(){
      console.log(this.props.courselist)
      const gridStyle={
          width:"33.3%",
          textAlign:'center',
      }
      const gridStyle2={
        width:"100%",
        textAlign:'center',
      }
      if(this.props.courselist.length<courseIDrow.length){
           courseIDrow=[];
           classRow=[];
      }
      for(let i=0;i<this.props.courselist.length;i++){
        if(_.indexOf(courseIDrow,this.props.courselist[i]["id"])===-1){
          courseIDrow.push(this.props.courselist[i]["id"]);
          var courseTeacher=[];
          var courseAssistant=[];
          for(let j=0;j<this.props.courselist[i].teachers.length;j++){
              courseTeacher.push(
                <span key={j} style={{marginLeft:"5px",marginRight:"5px"}}>
                    {this.props.courselist[i].teachers[j]["name"]}
                </span>
              )
          }
          for(let j=0;j<this.props.courselist[i].teachingAssistants.length;j++){
            courseAssistant.push(
              <span key={j} style={{marginLeft:"5px",marginRight:"5px"}}>
                  {this.props.courselist[i].teachingAssistants[j]["name"]}
              </span>
            )
          }
           classRow.push(
            <Col key={this.props.courselist[i]["id"]} xs={24} sm={12}>
            <Card title={
              <span>
              <Row>
                <Col xs={12} sm={8}>{this.props.courselist[i]["name"]}</Col>
                <Col xs={12} sm={8} style={{left:"15%"}}>{this.props.courselist[i].students.length}人</Col>
                <Col xs={12} sm={8} style={{left:"15%"}}>{this.props.courselist[i].marks}学分</Col>
                <Col xs={12} sm={8}>教师: {courseTeacher}</Col>
                <Col xs={12} sm={8} style={{left:"10%"}}>助教: {courseAssistant}</Col>
              </Row>
              <Row>
                <Col xs={12} sm={8} >开课学院: {this.props.courselist[i].school}</Col> 
                <Col xs={12} sm={8} style={{left:"10%"}}>时间: </Col>
              </Row> 
              </span>
            } 
            style={{marginLeft:"20px",marginRight:"20px",marginBottom:"20px"}}
            hoverable="true">
            <Card.Grid style={gridStyle2}>
            <Link to={'/studentcenter/class/'+this.props.courselist[i]["id"]+'/'} 
                  style={{color:"black"}}
            > 
              <span style={{fontSize:"25px"}}>
              更多历史作业任务....
              </span>
            </Link>
            </Card.Grid>
            </Card>
            </Col>             
           )
        }
      }
        return(
            <div>
            <div style={{"font-size":"28px",marginLeft:"20px",marginTop:"10px",marginBottom:"5px"}}>概览</div>
            <Card hoverable="true" style={{marginLeft:"20px",marginRight:"20px"}}>
              <Card.Grid style={gridStyle}>
              <p style={{"font-size":"20px"}}>已加入课程数:</p>
              <span style={{"font-size":'30px'}}>{this.props.courselist.length}  </span>
              个
              </Card.Grid>
              <Card.Grid style={gridStyle}>
              <p style={{"font-size":"20px"}}>进行中课程数:</p>
              <span style={{"font-size":'30px'}}>3  </span>
              个
              </Card.Grid>
              <Card.Grid style={gridStyle}>
              <p style={{"font-size":"20px"}}>已结束课程数:</p>
              <span style={{"font-size":'30px'}}>10  </span>
              个
              </Card.Grid>
            </Card>
            <div style={{"font-size":"28px",marginLeft:"20px",marginTop:"10px",marginBottom:"10px"}}>已加入课程班</div>
            <Row gutter={16}>
              {classRow}
            </Row>
             <br/><br/><br/><br/><br/><br/><br/><br/>
            </div>
        )
    }
}
export default Studentclass;