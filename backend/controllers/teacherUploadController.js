import TeacherUpload from '../models/TeacherUpload.js';

// Upload a new file (for teacher)
export const uploadFile = async (req, res) => {
  console.log('📁 [Teacher Uploads] Upload file request received');
  console.log('📁 [Teacher Uploads] Request body:', req.body);
  
  try {
    const { name, type, size, url, announcement, teacherName } = req.body;

    console.log('📁 [Teacher Uploads] Creating new upload entry...');
    const newUpload = new TeacherUpload({
      id: Date.now().toString(),
      name,
      type,
      size,
      url,
      announcement: announcement || 'No announcement',
      teacherName
    });

    const savedUpload = await newUpload.save();
    console.log('✅ [Teacher Uploads] File uploaded successfully:', savedUpload.name);

    res.status(201).json({ 
      success: true, 
      message: 'File uploaded successfully!',
      upload: savedUpload 
    });
  } catch (error) {
    console.error('❌ [Teacher Uploads] Error uploading file:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading file', 
      error: error.message 
    });
  }
};

// Get all teacher uploads
export const getAllUploads = async (req, res) => {
  console.log('📁 [Teacher Uploads] Get all uploads request received');
  
  try {
    const uploads = await TeacherUpload.find().sort({ uploadDate: -1 });
    console.log('✅ [Teacher Uploads] Retrieved', uploads.length, 'uploads');
    res.status(200).json({ success: true, uploads });
  } catch (error) {
    console.error('❌ [Teacher Uploads] Error fetching uploads:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching uploads', 
      error: error.message 
    });
  }
};



// Delete upload (for teacher)
export const deleteUpload = async (req, res) => {
  console.log('📁 [Teacher Uploads] Delete upload request received');
  console.log('📁 [Teacher Uploads] Upload ID:', req.params.id);
  
  try {
    const { id } = req.params;
    const deletedUpload = await TeacherUpload.findOneAndDelete({ id });

    if (!deletedUpload) {
      console.log('⚠️ [Teacher Uploads] Upload not found:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Upload not found' 
      });
    }

    console.log('✅ [Teacher Uploads] Upload deleted successfully:', deletedUpload.name);
    res.status(200).json({ 
      success: true, 
      message: 'Upload deleted successfully' 
    });
  } catch (error) {
    console.error('❌ [Teacher Uploads] Error deleting upload:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting upload', 
      error: error.message 
    });
  }
};
