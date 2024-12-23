
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Home from '../Pages/Home'
import Login from '../Pages/Login'
import Signup from '../Pages/Register'
import StudentProfile from '../Pages/StudentProfile'
import TeacherProfile from '../Pages/TeacherProfile'
import Course from '../Pages/Courses'
import AddAssignment from '../components/AddAssignment'
import Assessment from '../Pages/Assignments'
const Routers = () => {
  return (
    <Routes>
      <Route path='/' element={<Navigate to='home'/>} />
      <Route path='/home' element={<Home/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/register' element={<Signup/>} />
      <Route path='/sprofile' element={<StudentProfile/>} />
      <Route path='/tprofile' element={<TeacherProfile/>} />
      <Route path='/course' element={<Course/>} />
      <Route path='/add-assignment' element={<AddAssignment/>} />
      <Route path="/assessment/:courseId" element={<Assessment />} />
    </Routes>
  )
}

export default Routers
