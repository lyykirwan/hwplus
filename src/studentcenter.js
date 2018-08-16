import React from 'react';
import ReactDOM from 'react-dom';
import './studentcenter.css';
import { Upload, Icon, message,Row,Col,Button,Modal,Form,Input ,Card} from 'antd';
import axios from 'axios';
import { TIMEOUT } from 'dns';
var wxQRcode;//微信二维码
var avatarFile;//头像文件
var courseRow=[];//学生的课程列表
var Userlogin={type:'',content:''};
var pass={old_pass:"",new_pass:""};
const FormItem = Form.Item;
var validPassword =/^\w{6,20}$/;
var validPhone=/^1\d{10}$/;
var loginUser=axios.create({
  url:"http://106.14.148.208:8080/data/is_repeated/",
  headers:{"content-type":"application/json"},
  method:'post',
  data:Userlogin,
  timeout:1000,
})
function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}

function beforeUpload(file) {
    const isJPG = file.type === 'image/jpeg';
    if (!isJPG) {
      message.error('你只能上传jpg格式的头像!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不得大于2MB!');
    }
    return isJPG && isLt2M;
}

class UploadAvatar extends React.Component {
    constructor(props){
      super(props)
      this.state={
        loading: false,
      }
    }
  　　　
    handleChange = (info) => {
      if (info.file.status === 'uploading') {
        this.setState({ loading: true });
        return;
      }
      if (info.file.status === 'done') {
        avatarFile=info.file;
        getBase64(info.file.originFileObj, imageUrl => this.setState({
          imageUrl,
          loading: false,
        }));
      }
    }
  
    render() {
      const uploadButton = (
        <div>
          <Icon type={this.state.loading ? "loading" : "plus" } style={{fontSize:"45px"}}/>
          <div>添加头像</div>
        </div>
      );
      const imageUrl = this.state.imageUrl;
      return (
        //upload的data应该是一个参数对象或者是返回参数对象的方法
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          action="http://106.14.148.208:8080/data/avatars/"
          headers={{"content-type":"application/json","token":localStorage.getItem('token')}}
          beforeUpload={beforeUpload}
          onChange={this.handleChange}
          data={{user:this.props.userinformation["id"],useravatar:avatarFile}}
        >
          {imageUrl ? <img src={imageUrl} alt="头像" /> : uploadButton}
        </Upload>
      );
    }
  }

class Studentcenter extends React.Component{
    constructor(props){
      super(props);
      this.state={
        visible1:false,
        visible2:false,
        confirmDirty:false,
        userinformation:this.props.userinformation,
        username:this.props.userinformation.username,
        phone:this.props.userinformation.phone,
        class_number:this.props.userinformation.class_number,
        //studentCourse:this.props.studentCourse===undefined?[-1]:this.props.studentCourse,//课程ID列表
      }
    }
    
    componentDidMount(){
      let str=localStorage.getItem("user")
      let user=JSON.parse(str)
      this.setState({wxQRcode:"http://106.14.148.208:8080/data/users/"+user["id"]+"/"});
    }

    componentWillReceiveProps(nextProps){
      const gridStyle={
        width:'100%',
        textAlign:'center',
      }
      console.log(nextProps);
      console.log(nextProps.courselist["length"])
      if(JSON.stringify(nextProps.courselist)!==JSON.stringify(this.props.courselist)){
        for(let i in nextProps.courselist){
              courseRow.push(
                <Card.Grid key={nextProps.courselist[i]["id"]} style={gridStyle}>
                   {nextProps.courselist[i]["name"]} 
                </Card.Grid>
              )
        }
      }
      //this.setState({studentCourse:nextProps.studentCourse===undefined?[-1]:nextProps.studentCourse});
    }

    // componentWillUpdate(nextProps,nextState){
      //courseRow=[];
      //const gridStyle={
      //  width:'100%',
      //  textAlign:'center',
      //}
      //for(let i=0;i<nextState.studentCourse.length;i++){
      //  var getCourseInfo=axios.create({
      //    url:"http://106.14.148.208:8080/data/courses/"+nextState.studentCourse[i]+"/",
      //    headers:{"content-type":"application/json","token":localStorage.getItem('token')},
      //    method:'get',
      //    timeout:1000,
      //   })
      //  getCourseInfo().then(function(response){
       //   courseRow.push(
       //     <Card.Grid key={response.data.id} style={gridStyle}>
        //      {response.data.name}
        //    </Card.Grid>
       //   );
       // })
       // .catch(function(error){
       //   console.log(error);
       // })
     // } 
      //console.log("done") 
   // }

    showModal1=()=>{
      this.setState({visible1:true});
    }

    showModal2=()=>{
      this.setState({visible2:true});
    }

    handleCancel1=()=>{
      this.setState({visible1:false});
    }

    handleCancel2=()=>{
      this.setState({visible2:false});
    }

    handleConfirmBlur = (e) => {
      const value = e.target.value;
      this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    }
    compareToFirstPassword = (rule, value, callback) => {
      const form = this.props.form;
      if (value && value !== form.getFieldValue('新的密码')) {
        callback('您输入的两个密码不一致!');
      } else {
        callback();
      }
    }
    validateToNextPassword = (rule, value, callback) => {
      const form = this.props.form;
      if (value && this.state.confirmDirty) {
        form.validateFields(['再次确认'], { force: true });
      }
      if(value&&!validPassword.test(value)){
        callback("密码格式不正确(密码必须为6-20位的字母或数字组合)");
      }
      callback();
   }

     handleSubmit1=(e)=>{
       e.preventDefault();
       this.props.form.validateFieldsAndScroll(["原密码","新的密码","再次确认"],(err,values)=>{
          if(!err){
              pass.old_pass=values.原密码;
              pass.new_pass=values.新的密码;
              var changePass=axios.create({
                url:"http://106.14.148.208:8088/account/change_password/",
                headers:{"content-type":"application/json","token":localStorage.getItem('token')},
                method:'post',
                data:pass,
                timeout:1000,
              })
              changePass().then(function(response){
                if(response.data.result.code==1000){
                  message.success('密码修改成功!',3);
                }else if(response.data.result.code==4040){
                  message.error('密码修改失败，可能是由于您的原密码不符',3);
                }
                console.log(response)
              })
              .catch(function(error){
                message.error('密码修改失败，可能是由于您的原密码不符',3);
              })
              this.setState({visible1:false});
          }
       });
     }

     validateUsername=(rule,value,callback)=>{
      if(value){
      const form=this.props.form;
      Userlogin.type="username";
      Userlogin.content=form.getFieldValue('用户名');
      loginUser().then(function(response){
        if(response.data.data.repeat){
          callback('该用户名已被注册!');
        }else{
          callback();
        }
      })
      .catch(function(error){
        console.log(error);
      });
      }else{callback();}
    }

    checkVaildPhone=(rule,value,callback)=>{
      if(value){
      const form=this.props.form;
      Userlogin.type="phone";
      Userlogin.content=form.getFieldValue('手机号');
      if(value&&!validPhone.test(value)){
        callback('您的手机号格式不正确!');
      }
      loginUser().then(function(response){
        if(response.data.data.repeat){
          callback('该手机号已被注册!');
        }else{
          callback();
        }
      }
       )      
      .catch(function(error){
        console.log(error);
      });
      }else{callback();}
    }

    handleSubmit2=(e)=>{
      e.preventDefault();
      this.props.form.validateFieldsAndScroll(["用户名","班级号","手机号"],(err,values)=>{
         if(!err){
             let str=localStorage.getItem("user")
             var user=JSON.parse(str)//字符串转换为对象
             var changeuserinformation=axios.create({
               url:"http://106.14.148.208:8080/data/users/"+localStorage.getItem("userloginKey")+"/",
               headers:{"content-type":"application/json","token":localStorage.getItem('token')},
               method:'put',
               data:user,
               timeout:1000,
             })
             if(values.用户名){
               user.username=values.用户名;
             }
             if(values.班级号){
               user.class_number=values.班级号;
             }
             if(values.手机号){
               user.phone=values.手机号;
             }
             var that=this;
             if(values.用户名||values.班级号||values.手机号){
             changeuserinformation().then(function(response){
               that.setState({username:user.username,
               class_number:user.class_number,
               phone:user.phone
              })
              that.props.changeinformation(user);
               message.success('用户信息修改成功!',3);
             })
             .catch(function(error){
               message.error('用户信息修改失败!',3);
             })
            }
             this.setState({visible2:false});
         }
      });
    }

    render(){
      //console.log(this.state.studentCourse)
      const { getFieldDecorator } = this.props.form;
      const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 8 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
      };
      const tailFormItemLayout = {
        wrapperCol: {
          xs: {
            span: 24,
            offset: 0,
          },
          sm: {
            span: 16,
            offset: 8,
          },
        },
      };
      const tips='您只需填自己想要变更的某个信息，不用把所有信息全填满'
      console.log(courseRow);
        return(
            //背景以后会有专门的壁纸
            <div>
            <div style={{ textAlign: 'center' }}>
              <Row>
                <Col xs={24} sm={6}>
                   <div className='uploadavatar'>
                   <UploadAvatar userinformation={this.state.userinformation} />
                   </div>
                </Col>
                <Col xs={24} sm={6}>
                   <div style={{"font-size":"16px","margin-top":"30px",position:"relative"}}>
                   用户名
                   <span style={{ "margin-left":"20px","border-style":"solid","border-width":"thin","padding-left":30,"padding-right":30,"border-color":"#AAAAAA"}}>
                   {this.state.userinformation.username}
                   </span>
                   </div>
                   <div style={{"font-size":"16px","margin-top":"30px",position:"relative"}}>
                   真实姓名
                   <span style={{ "margin-left":"20px","border-style":"solid","border-width":"thin","padding-left":30,"padding-right":30,"border-color":"#AAAAAA"}}>
                   {this.state.userinformation["name"]}
                   </span>
                   </div>
                   <div style={{"font-size":"16px","margin-top":"30px",position:"relative"}}>
                   班级
                   <span style={{ "margin-left":"20px","border-style":"solid","border-width":"thin","padding-left":30,"padding-right":30,"border-color":"#AAAAAA"}}>
                   {this.state.userinformation.class_number}
                   </span>
                   </div>
                </Col>
                <Col xs={24} sm={6}>
                   <div style={{"font-size":"16px","margin-top":"30px",position:"relative"}}>
                   学号
                   <span style={{ "margin-left":"20px","border-style":"solid","border-width":"thin","padding-left":30,"padding-right":30,"border-color":"#AAAAAA"}}>
                   {this.state.userinformation.bupt_id}
                   </span>
                   </div>
                   <div style={{"font-size":"16px","margin-top":"30px",position:"relative"}}>
                   邮箱
                   <span style={{ "margin-left":"20px","border-style":"solid","border-width":"thin","padding-left":30,"padding-right":30,"border-color":"#AAAAAA"}}>
                   {this.state.userinformation.email}
                   </span>
                   </div>
                   <div style={{"font-size":"16px","margin-top":"30px",position:"relative"}}>
                   手机号
                   <span style={{ "margin-left":"20px","border-style":"solid","border-width":"thin","padding-left":30,"padding-right":30,"border-color":"#AAAAAA"}}>
                   {this.state.userinformation.phone}
                   </span>
                   </div>
                </Col>
                <Col xs={24} sm={6}>
                   <Button style={{"margin-top":"30px"}} onClick={this.showModal1}>修改密码?</Button>
                   <br/>
                   <Button style={{"margin-top":"15px"}} onClick={this.showModal2}>变更信息</Button>
                </Col>
              </Row>
              <Row>
                <Col xs={24} sm={6} offset={6}>
                   <div style={{"font-size":"16px","margin-top":"30px",position:"relative"}}>
                    已加入课程班
                   </div>
                   <Card style={{width:400}} hoverable="true">
                     {courseRow}
                   </Card>
                </Col>
              </Row>  
            </div>
            <Modal
              title="修改密码"
              visible={this.state.visible1}
              footer={null}
              onCancel={this.handleCancel1}
              destroyOnClose={true}
            >
              <Form onSubmit={this.handleSubmit1}>
                <FormItem
                  {...formItemLayout}
                  label="原密码"
                >
                {getFieldDecorator('原密码', {
                rules: [{required: true, message: '请输入密码!',whitespace:true}],
                 })(
                <Input type="password" />
                )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="新的密码"
                >
                {getFieldDecorator('新的密码', {
                rules: [{
                  required: true, message: '请输入密码!',whitespace:true
                },{
                  validator:this.validateToNextPassword,
                }],
                 })(
                <Input type="password" />
                )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="再次确认"
                >
                {getFieldDecorator('再次确认', {
                rules: [{
                  required: true, message: '请输入密码!',whitespace:true
                },{
                  validator:this.compareToFirstPassword,
                }],
                 })(
                <Input type="password" onBlur={this.handleConfirmBlur} />
                )}
                </FormItem>
                <FormItem {...tailFormItemLayout}>
                   <Button type="primary" htmlType="submit" className="submit2" >确认</Button>
                </FormItem>
              </Form>
            </Modal>
            <Modal
               title="变更信息"
               visible={this.state.visible2}
               footer={null}
               onCancel={this.handleCancel2}
               destroyOnClose={true}
            >
              <Form onSubmit={this.handleSubmit2}>
                 <FormItem
                   {...formItemLayout}
                   label="新的用户名"
                 >
                  {getFieldDecorator('用户名', {
                   rules: [{
                   whitespace:true
                   }, {
                   validator: this.validateUsername,
                   }],
                  })(
                  <Input />
                  )}
                 </FormItem>
                 <FormItem
                   {...formItemLayout}
                   label="新的班级号"
                 >
                  {getFieldDecorator('班级号', {
                   rules: [{
                   whitespace:true
                   }],
                  })(
                  <Input />
                  )}
                 </FormItem>
                 <FormItem
                   {...formItemLayout}
                   label="新的手机号"
                 >
                  {getFieldDecorator('手机号', {
                   rules: [{
                   whitespace:true
                   }, {
                   validator: this.checkVaildPhone,
                   }],
                  })(
                  <Input />
                  )}
                 </FormItem>
                 <FormItem {...tailFormItemLayout} help={tips}>
                   <Button type="primary" htmlType="submit" className="submit2" >确认</Button>
                </FormItem>
              </Form>
            </Modal>
            </div>
        )
    }
}
const WrappedStudentcenter=Form.create()(Studentcenter);
export default WrappedStudentcenter
