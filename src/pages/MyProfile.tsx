import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Layout, Form, Input, Upload, Button, message, List, Avatar } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import Sidebar from '../components/sidebar';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { Timestamp } from 'firebase/firestore';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CheckOutlined, EditOutlined } from '@ant-design/icons';

const { Content } = Layout;

interface CommentAuthor {
  email: string ;
  first_name: string ;
  last_name: string ;
  password: string ;
  profile_picture: string ;
}

interface Comment {
  author: CommentAuthor;
  content: string;
}

interface Values { 
  email: string;
  first_name: string;
  last_name: string;
}
interface Post {
  post_id: string;
  email: string;
  content: string;
  author: Author;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  comments: Comment[]; // or Comment[] if you have a Comment interface
}

interface Author {
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string;
}

interface CommentAuthor {
  email: string ;
  first_name: string ;
  last_name: string ;
  password: string ;
  profile_picture: string ;
}

interface Comment {
  author: CommentAuthor;
  content: string;
}

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  profile_picture: string;
}

// Auth state type
interface AuthState {
  user: UserData ;
  error: string | null;
  isAuthenticated: boolean; // Add an isAuthenticated flag
}

interface AppState {
  auth: AuthState;
  // other slices of state...
}


const Container = styled(Layout)`
  min-height: 98vh;
  @media (max-width: 600px) {
    margin: auto;
    left: auto;
  }
`;

const StyledContent = styled(Content)`
    margin-left: 20%;
    width: 70%;
    padding: 24px;
    @media (max-width: 600px) {
      text-align: center;
      width: auto;
      margin: auto;
    }
`;

const Heading = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
  @media (max-width: 600px) {
    width: auto;
  }
`;

const StyledForm = styled(Form)`
  label {
    font-weight: bold;
  }

  .ant-form-item {
    margin-bottom: 20px;
  }

  .ant-upload {
    margin-top: 20px;
  }

  .ant-btn-primary {
    background-color: #1890ff;
    border-color: #1890ff;
  }
`;

const ListSection = styled.div`
  margin-top: 40px;

  h2 {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 20px;
  }

  .ant-list-item {
    border: 1px solid #f0f0f0;
    margin-bottom: 10px;
  }
  @media (max-width: 600px) {
    width: auto;
  }
`;

const CustomAvatar = styled(Avatar)`
  @media (max-width: 600px) {
    position: relative;
  }
`
const CustomContainer = styled.div`
  position: absolute;
  @media (max-width: 600px) {
    position: relative;
    text-align: center;
  }
`

const MyProfilePage: React.FC = () => {


  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const CurrentUser = useSelector((state: AppState) => state.auth.user);

  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  useEffect(() => {
    form.setFieldsValue({
      email: CurrentUser.email,
      first_name: CurrentUser.first_name,
      last_name : CurrentUser.last_name,
    });

    fetchPosts(CurrentUser.email);
  }, [CurrentUser, form]);

  const fetchPosts = async (userEmail: string) => {
    try {
      const postsCollection = collection(firestore, 'posts');
      const postQuery = query(postsCollection, where('email', '==', userEmail));

      const postsSnapshot = await getDocs(postQuery);

      const filteredPosts: Post[] = [];

      postsSnapshot.forEach((doc) => {
        const postData = { id: doc.id, ...doc.data() } as unknown as Post;
        filteredPosts.push(postData as Post);
      });

      setPosts(filteredPosts);
    } catch (error: unknown) {
      console.error('Error fetching posts:');
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const storageRef = ref(storage, `profileImages/${CurrentUser.email}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateUserProfilePicture(url)
      await changeAuthStatePicture(url)
      await updatePostProfilePicture(url)
      await updateCommentsProfilePicture(url)
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Failed to upload file. Please try again.');
    }
  };

  const updatePostProfile = async (values: Values) => {
    console.log('Post Profile working');
  
    try {
      const postsCollection = collection(firestore, 'posts');
      const postsQuery = query(postsCollection, where('author.email', '==', CurrentUser.email));
      const postsSnapshot = await getDocs(postsQuery);
  
      if (postsSnapshot.size > 0) {
        const postDoc = postsSnapshot.docs[0];
        const postRef = doc(postsCollection, postDoc.id);
  
        // Extract the currenauthor data
        const currentAuthor = postDoc.data().author;
  
        // Check if the current author email matches the logged-in user's email
        if (currentAuthor.email === CurrentUser.email) {
          // Update the post with new author information
          await updateDoc(postRef, {
            'author.first_name': values.first_name,
            'author.last_name': values.last_name,
          });
          console.log('Post author information updated');
        } else {
          console.error('Unauthorized to update post author information');
        }
      } else {
        console.error('Post not found for author email:', CurrentUser.email);
      }
  
      setEditMode(false); // Reset edit mode
    } catch (error: unknown) {
      console.error('Error updating post profile:');
      message.error('Failed to update post profile. Please try again.');
    }
  };
  
  const changeAuthState =(values : Values) =>{
    console.log(values)
    console.log('lets do')
    try{
      // Retrieve the current auth state from local storage
    const currentAuthStateString = localStorage.getItem('authState');
    if (currentAuthStateString) {
      // Parse the string to get the current auth state object
      const currentAuthState = JSON.parse(currentAuthStateString);

      // Modify the user data in the auth state
      if (currentAuthState && currentAuthState.user) {
        currentAuthState.user.first_name = values.first_name;
        currentAuthState.user.last_name = values.last_name;
      }

      // Save the updated auth state back to local storage
      localStorage.setItem('authState', JSON.stringify(currentAuthState));
    }
    window.location.reload();
    }
    catch(error: unknown){
      console.log('Error while saving in changing state ')
    }
  }

  const updateUserProfile = async (values: Values) => {
    console.log(values.first_name)
    console.log('updateUserProfile working')
    try {
        const usersCollection = collection(firestore, 'users');
        const userQuery = query(usersCollection, where('email', '==', CurrentUser.email));
        const usersSnapshot = await getDocs(userQuery);
      
        if (usersSnapshot.size > 0) {
          const userDoc = usersSnapshot.docs[0];
          const userRef = doc(usersCollection, userDoc.id);
      
          await updateDoc(userRef, {
            first_name: values.first_name,
            last_name: values.last_name,
          });
        } else {
          console.error('User not found for email:', CurrentUser.email);
        }

      setEditMode(false); // Reset edit mode
      await updatePostProfile(values)
      await changeAuthState(values)
    } catch (error: unknown) {
      console.error('Error updating user profile:');
      message.error('Failed to update user profile. Please try again.');
    }
  };


  // TO MAKE THE CHANGES FOR THE PROFILE PICTURE

  const updatePostProfilePicture = async (imageUrl: string) => {
    console.log("Updating profile picture in posts");
    try {
      const postsCollection = collection(firestore, 'posts');
      const postsQuery = query(postsCollection, where('author.email', '==', CurrentUser.email));
      const postsSnapshot = await getDocs(postsQuery);
  
      if (postsSnapshot.size > 0) {
        postsSnapshot.docs.forEach(async (postDoc) => {
          const postRef = doc(postsCollection, postDoc.id);
  
          // Extract the current author data
          const currentAuthor = postDoc.data().author;
  
          // Check if the current author email matches the logged-in user's email
          if (currentAuthor.email === CurrentUser.email) {
            console.log('Updating profile picture in post:', postDoc.id);
            // Update the post with the new author information
            await updateDoc(postRef, {
              'author.profile_picture': imageUrl,
            });
          } else {
            console.warn('Unauthorized to update post:', postDoc.id);
          }
        });
        console.log('All matching posts updated');
      } else {
        console.error('No posts found for author email:', CurrentUser.email);
      }
    } catch (error: unknown) {
      console.error('Error updating post profile:', error);
      // Assuming `message` is a notification system like Ant Design's message
      message.error('Failed to update post profile. Please try again.');
    }
  };
  

  const changeAuthStatePicture =(imageUrl: string) =>{
    console.log('2')
    try{
      // Retrieve the current auth state from local storage
    const currentAuthStateString = localStorage.getItem('authState');
    if (currentAuthStateString) {
      // Parse the string to get the current auth state object
      const currentAuthState = JSON.parse(currentAuthStateString);

      // Modify the user data in the auth state
      if (currentAuthState && currentAuthState.user) {
        currentAuthState.user.profile_picture = imageUrl
      }

      // Save the updated auth state back to local storage
      localStorage.setItem('authState', JSON.stringify(currentAuthState));
    }
    }
    catch(error: unknown){
      console.log('Error while saving in changing state ')
    }
  }

  const updateUserProfilePicture = async (imageUrl : string) => {
    console.log('3')
    try {
        const usersCollection = collection(firestore, 'users');
        const userQuery = query(usersCollection, where('email', '==', CurrentUser.email));
        const usersSnapshot = await getDocs(userQuery);
      
        if (usersSnapshot.size > 0) {
          const userDoc = usersSnapshot.docs[0];
          const userRef = doc(usersCollection, userDoc.id);
      
          await updateDoc(userRef, {
            profile_picture: imageUrl
          });
        } else {
          console.error('image not uploaded');
        }
    } catch (error: unknown) {
      console.error('Error updating user profile:');
      message.error('Failed to update user profile. Please try again.');
    }
  };

  const updateCommentsProfilePicture = async (imageUrl: string) => {
    try {
      // Get reference to the posts collection
      const postsCollection = collection(firestore, 'posts');
  
      // Query all documents in the posts collection
      const postsQuery = query(postsCollection);
      const postsSnapshot = await getDocs(postsQuery);
  
      // Iterate through each post
      postsSnapshot.forEach(async (postDoc) => {
        const postRef = doc(postsCollection, postDoc.id);
  
        // Get the comments array from the post document
        const comments = postDoc.data().comments;
  
        // Check if comments is defined and is an array
        if (Array.isArray(comments)) {
          // Update each comment if author.email matches CurrentUser.email
          comments.forEach(async (comment: Comment) => {
            if (comment.author.email === CurrentUser.email) {
              // Update the comment's author profile_picture
              comment.author.profile_picture = imageUrl;
            }
          });
  
          // Update the post with the modified comments array
          await updateDoc(postRef, { comments });
        }
      });
  
      console.log('Comments profile pictures updated successfully!');
    } catch (error: unknown) {
      console.error('Error updating comments profile pictures:');
      message.error('Failed to update comments profile pictures. Please try again.');
    }
  };
  
  



  const handleDone = async () => {
    setLoading(true);
    console.log("it has begun")

    try {
        const values = await form.getFieldsValue()
        await updateUserProfile(values)
      message.success('Profile updated successfully!');
    } catch (error: unknown) {
      console.error('Error updating profile:');
      message.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = async (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';

    if (isJpgOrPng) {
      await uploadFile(file)
      console.log('done uploading at all places')
      message.success('Image Uploaded Successfully!');
      setTimeout(()=> window.location.reload() , 1000)
    } else {
      message.error('You can only upload JPG/PNG file!');
    }

    // Returning false prevents the file from being added to the fileList
    return false;
  };

  const handleFileSelection = (file: File) => {
    // Set the selected file in the state or perform any other necessary actions
    setSelectedFile(file);
    message.success('File selected. Click "Upload Photo" to upload.');
  };

  useEffect(() => {
    console.log('current user: ' + CurrentUser)
  }, [])

  return (
    <Container>
      <Sidebar />
      <Layout>
        <StyledContent>
          <Heading style={{ margin: '20px' }}>My Profile</Heading>
          <CustomContainer>
            <CustomAvatar
              size={190}
              icon={<UserOutlined />}
              src={CurrentUser.profile_picture}
              alt="Profile Picture"
            />
          <Form.Item name="profilePhoto" style={{ margin: '20px' }}>
            <Upload
              name="profilePhoto"
              listType="picture"
              maxCount={1}
              accept="image/jpeg,image/png"
              beforeUpload={handleFileSelection}
            >
              <Button icon={<UploadOutlined />}>Choose Photo</Button>
            </Upload>
            </Form.Item>
            {selectedFile && (
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={() => beforeUpload(selectedFile)}
                  style={{ marginLeft: '8px' }}
                >
                  Upload Photo
                </Button>
              )}
        </CustomContainer>
          <StyledForm
            form={form}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{
              email: CurrentUser.email,
              first_name: CurrentUser.first_name,
              last_ame: CurrentUser.last_name,
            }}
          >
            <Form.Item label="Email ID">
              <p style={{ margin: 'auto' }}>{CurrentUser.email}</p>
            </Form.Item>
            <Form.Item
              label="First Name"
              name="first_name"
              rules={[{ required: true, message: 'Please enter your first name!' }]}
            >
              <Input prefix={<UserOutlined />} readOnly={!editMode} />
            </Form.Item>
            <Form.Item
              label="Last Name"
              name="last_name"
              rules={[{ required: true, message: 'Please enter your last name!' }]}
            >
              <Input prefix={<UserOutlined />} readOnly={!editMode} />
            </Form.Item>

            
            <Form.Item style={{ margin:'auto', width: '50%'}} wrapperCol={{ offset: 8, span: 16 }}>
              {editMode ? (
                <Button type="primary" onClick={() => handleDone()} htmlType="submit" loading={loading} style={{ backgroundColor: '#4CAF50', borderColor: '#4CAF50' }}>
                <CheckOutlined /> Done
              </Button>
              ) : (
               <Button type="dashed" onClick={() => setEditMode(true)} icon={<EditOutlined />}>
                Edit
              </Button>
              )}
            </Form.Item>
          </StyledForm>

          <ListSection style={{marginTop: '130px'}}>
            <h2 style={{ textAlign: 'center' }}>My Posts</h2>
            <List
              itemLayout="horizontal"
              dataSource={posts}
              renderItem={(post) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} src={CurrentUser.profile_picture} />}
                    title={post.author.first_name}
                    description={post.content}
                  />
                </List.Item>
              )}
            />
          </ListSection>
        </StyledContent>
      </Layout>
    </Container>
  );
};

export default MyProfilePage;
