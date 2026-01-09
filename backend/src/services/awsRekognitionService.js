const { RekognitionClient, DetectFacesCommand, DetectLabelsCommand } = require('@aws-sdk/client-rekognition');
const fs = require('fs');

// Initialize AWS Rekognition client
const getRekognitionClient = () => {
  const region = process.env.AWS_REGION || 'us-east-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env file');
  }

  return new RekognitionClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

/**
 * Analyze body image using AWS Rekognition
 * Detects: body type, height proportions, skin tone, posture
 */
const analyzeBodyImage = async (imagePath) => {
  try {
    const client = getRekognitionClient();
    
    // Read image file
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Use DetectLabels to identify body characteristics
    const labelsCommand = new DetectLabelsCommand({
      Image: {
        Bytes: imageBuffer,
      },
      MaxLabels: 20,
      MinConfidence: 70,
    });

    const labelsResponse = await client.send(labelsCommand);
    
    // Also detect faces to get additional information
    const facesCommand = new DetectFacesCommand({
      Image: {
        Bytes: imageBuffer,
      },
      Attributes: ['ALL'],
    });

    const facesResponse = await client.send(facesCommand);

    // Process labels to extract body information
    const labels = labelsResponse.Labels || [];
    const faces = facesResponse.FaceDetails || [];

    // Extract body type from labels
    const bodyType = extractBodyType(labels);
    const heightProportion = extractHeightProportion(labels, faces);
    const bodyShape = extractBodyShape(labels);
    const skinTone = extractSkinTone(faces, labels);
    const posture = extractPosture(labels);

    // Generate recommendations based on analysis
    const fitRecommendations = generateFitRecommendations(bodyType, bodyShape);
    const styleSuggestions = generateStyleSuggestions(bodyType, bodyShape, heightProportion);

    return {
      bodyType,
      heightProportion,
      bodyShape,
      skinTone,
      posture,
      fitRecommendations,
      styleSuggestions,
      confidence: 'high',
      analyzedAt: new Date(),
      analysisType: 'body',
      model: 'aws-rekognition',
      rawLabels: labels.map(l => l.Name),
      faceCount: faces.length,
    };
  } catch (error) {
    console.error('AWS Rekognition Error:', error.message);
    throw new Error(`Body analysis failed: ${error.message}`);
  }
};

/**
 * Analyze face image using AWS Rekognition
 * Detects: face shape, skin tone, features
 */
const analyzeFaceImage = async (imagePath) => {
  try {
    const client = getRekognitionClient();
    
    // Read image file
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Detect faces with all attributes
    const facesCommand = new DetectFacesCommand({
      Image: {
        Bytes: imageBuffer,
      },
      Attributes: ['ALL'],
    });

    const facesResponse = await client.send(facesCommand);

    if (!facesResponse.FaceDetails || facesResponse.FaceDetails.length === 0) {
      throw new Error('No face detected in the image');
    }

    const faceDetails = facesResponse.FaceDetails[0];
    
    // Extract face information
    const faceShape = extractFaceShape(faceDetails);
    const skinTone = extractSkinToneFromFace(faceDetails);
    const features = extractFaceFeatures(faceDetails);
    
    // Generate recommendations
    const hairstyleRecommendations = generateHairstyleRecommendations(faceShape);
    const accessoryRecommendations = generateAccessoryRecommendations(faceShape, features);
    const makeupSuggestions = generateMakeupSuggestions(faceShape, skinTone);

    return {
      faceShape,
      skinTone,
      features,
      hairstyleRecommendations,
      accessoryRecommendations,
      makeupSuggestions,
      confidence: 'high',
      analyzedAt: new Date(),
      analysisType: 'face',
      model: 'aws-rekognition',
      ageRange: faceDetails.AgeRange ? `${faceDetails.AgeRange.Low}-${faceDetails.AgeRange.High}` : null,
      gender: faceDetails.Gender ? faceDetails.Gender.Value : null,
      emotions: faceDetails.Emotions ? faceDetails.Emotions.map(e => e.Type).join(', ') : null,
    };
  } catch (error) {
    console.error('AWS Rekognition Error:', error.message);
    throw new Error(`Face analysis failed: ${error.message}`);
  }
};

/**
 * Extract body type from Rekognition labels
 */
const extractBodyType = (labels) => {
  const labelNames = labels.map(l => l.Name.toLowerCase());
  
  // Check for body type indicators
  if (labelNames.some(n => n.includes('athlete') || n.includes('sport'))) {
    return 'athletic';
  }
  if (labelNames.some(n => n.includes('person') && labelNames.some(n => n.includes('tall')))) {
    return 'tall';
  }
  if (labelNames.some(n => n.includes('person') && labelNames.some(n => n.includes('short')))) {
    return 'petite';
  }
  
  // Default based on person detection
  return 'average';
};

/**
 * Extract height proportion from labels and face data
 */
const extractHeightProportion = (labels, faces) => {
  const labelNames = labels.map(l => l.Name.toLowerCase());
  
  if (labelNames.some(n => n.includes('tall'))) {
    return 'tall';
  }
  if (labelNames.some(n => n.includes('short'))) {
    return 'short';
  }
  
  // Use bounding box dimensions if available
  if (faces.length > 0 && faces[0].BoundingBox) {
    const box = faces[0].BoundingBox;
    const aspectRatio = box.Height / box.Width;
    if (aspectRatio > 1.3) return 'tall';
    if (aspectRatio < 0.9) return 'short';
  }
  
  return 'average';
};

/**
 * Extract body shape from labels
 */
const extractBodyShape = (labels) => {
  const labelNames = labels.map(l => l.Name.toLowerCase());
  
  // This is a simplified extraction - Rekognition doesn't directly detect body shapes
  // We can infer from clothing labels or use default
  const shapes = ['rectangle', 'triangle', 'inverted-triangle', 'hourglass', 'pear', 'apple'];
  
  // Default to rectangle if no specific indicators
  return 'rectangle';
};

/**
 * Extract skin tone from face details or labels
 */
const extractSkinTone = (faces, labels) => {
  if (faces.length > 0 && faces[0].Quality) {
    // Use face quality and brightness as indicators
    const brightness = faces[0].Quality?.Brightness || 0.5;
    
    if (brightness > 0.8) return 'fair';
    if (brightness > 0.6) return 'light';
    if (brightness > 0.4) return 'medium';
    if (brightness > 0.2) return 'tan';
    return 'dark';
  }
  
  return 'medium';
};

/**
 * Extract skin tone from face details
 */
const extractSkinToneFromFace = (faceDetails) => {
  if (faceDetails.Quality) {
    const brightness = faceDetails.Quality.Brightness || 0.5;
    
    if (brightness > 0.8) return 'fair';
    if (brightness > 0.6) return 'light';
    if (brightness > 0.4) return 'medium';
    if (brightness > 0.2) return 'tan';
    return 'dark';
  }
  
  return 'medium';
};

/**
 * Extract posture from labels
 */
const extractPosture = (labels) => {
  const labelNames = labels.map(l => l.Name.toLowerCase());
  
  if (labelNames.some(n => n.includes('standing'))) {
    return 'Standing posture detected';
  }
  if (labelNames.some(n => n.includes('sitting'))) {
    return 'Sitting posture detected';
  }
  
  return 'Neutral posture detected';
};

/**
 * Extract face shape from face landmarks
 */
const extractFaceShape = (faceDetails) => {
  if (!faceDetails.Landmarks) {
    return 'oval'; // Default
  }

  const landmarks = faceDetails.Landmarks;
  
  // Find key points
  const jawline = landmarks.filter(l => l.Type === 'jawline');
  const faceOutline = landmarks.filter(l => l.Type === 'faceOutline');
  
  if (faceDetails.BoundingBox) {
    const width = faceDetails.BoundingBox.Width;
    const height = faceDetails.BoundingBox.Height;
    const aspectRatio = height / width;
    
    // Determine shape based on proportions
    if (aspectRatio > 1.4) return 'oblong';
    if (aspectRatio < 0.9) return 'round';
    if (width > 0.5) return 'square';
    
    // Check jawline for triangle/heart
    if (jawline.length > 0) {
      const jawWidth = Math.max(...jawline.map(j => j.X)) - Math.min(...jawline.map(j => j.X));
      if (jawWidth < width * 0.7) return 'heart';
      if (jawWidth > width * 0.9) return 'triangle';
    }
  }
  
  return 'oval'; // Default
};

/**
 * Extract face features
 */
const extractFaceFeatures = (faceDetails) => {
  const features = {
    facialFeatures: 'Standard facial features detected',
  };

  if (faceDetails.EyesOpen && faceDetails.EyesOpen.Value !== undefined) {
    features.eyesOpen = faceDetails.EyesOpen.Value;
  }
  
  if (faceDetails.MouthOpen && faceDetails.MouthOpen.Value !== undefined) {
    features.mouthOpen = faceDetails.MouthOpen.Value;
  }
  
  if (faceDetails.Smile && faceDetails.Smile.Value !== undefined) {
    features.smile = faceDetails.Smile.Value;
  }
  
  if (faceDetails.Eyeglasses && faceDetails.Eyeglasses.Value) {
    features.eyeglasses = true;
  }
  
  if (faceDetails.Sunglasses && faceDetails.Sunglasses.Value) {
    features.sunglasses = true;
  }
  
  if (faceDetails.Gender) {
    features.gender = faceDetails.Gender.Value;
  }
  
  if (faceDetails.AgeRange) {
    features.ageRange = `${faceDetails.AgeRange.Low}-${faceDetails.AgeRange.High}`;
  }

  return features;
};

/**
 * Generate fit recommendations based on body type and shape
 */
const generateFitRecommendations = (bodyType, bodyShape) => {
  const recommendations = [];
  
  if (bodyType === 'athletic') {
    recommendations.push('Fitted tops that highlight your athletic build');
    recommendations.push('Structured pieces that complement your physique');
  } else if (bodyType === 'petite') {
    recommendations.push('High-waisted bottoms to create length');
    recommendations.push('Fitted styles that don\'t overwhelm your frame');
  } else if (bodyType === 'tall') {
    recommendations.push('Longer hemlines and proportions');
    recommendations.push('Layered pieces to add dimension');
  } else {
    recommendations.push('Well-fitted clothing that follows your natural silhouette');
  }
  
  if (bodyShape === 'hourglass') {
    recommendations.push('Belted styles to emphasize your waist');
    recommendations.push('Fitted tops that highlight your curves');
  } else if (bodyShape === 'rectangle') {
    recommendations.push('A-line dresses to create curves');
    recommendations.push('Peplum tops to add definition');
  }
  
  return recommendations;
};

/**
 * Generate style suggestions
 */
const generateStyleSuggestions = (bodyType, bodyShape, heightProportion) => {
  const suggestions = [];
  
  suggestions.push('Experiment with different necklines to find what suits you');
  
  if (heightProportion === 'short') {
    suggestions.push('Vertical lines can create a lengthening effect');
    suggestions.push('Monochromatic outfits can elongate your silhouette');
  }
  
  if (bodyShape === 'hourglass' || bodyShape === 'pear') {
    suggestions.push('Belted styles can help define your waist');
    suggestions.push('A-line skirts work well for your body type');
  }
  
  suggestions.push('Consider your proportions when selecting patterns and textures');
  
  return suggestions;
};

/**
 * Generate hairstyle recommendations
 */
const generateHairstyleRecommendations = (faceShape) => {
  const recommendations = [];
  
  switch (faceShape) {
    case 'round':
      recommendations.push('Long layers to elongate your face');
      recommendations.push('Side-swept bangs to add angles');
      break;
    case 'square':
      recommendations.push('Soft waves to soften your features');
      recommendations.push('Layered cuts to add movement');
      break;
    case 'heart':
      recommendations.push('Chin-length bobs to balance your face');
      recommendations.push('Side-parted styles');
      break;
    case 'oblong':
      recommendations.push('Volume at the sides to add width');
      recommendations.push('Bangs to shorten the face');
      break;
    default:
      recommendations.push('Most hairstyles work well with your face shape');
      recommendations.push('Consider layered cuts for dimension');
  }
  
  return recommendations;
};

/**
 * Generate accessory recommendations
 */
const generateAccessoryRecommendations = (faceShape, features) => {
  const recommendations = [];
  
  if (faceShape === 'round' || faceShape === 'square') {
    recommendations.push('Oval or round glasses to soften angles');
  } else if (faceShape === 'oblong') {
    recommendations.push('Wider frames to add width');
  }
  
  recommendations.push('Drop earrings can elongate your face');
  recommendations.push('Consider your face shape when selecting accessories');
  
  if (features.eyeglasses) {
    recommendations.push('Your current glasses complement your face shape');
  }
  
  return recommendations;
};

/**
 * Generate makeup suggestions
 */
const generateMakeupSuggestions = (faceShape, skinTone) => {
  const suggestions = [];
  
  suggestions.push('Choose foundation that matches your skin tone');
  
  if (faceShape === 'round') {
    suggestions.push('Contour along the jawline to add definition');
  }
  
  if (skinTone === 'fair' || skinTone === 'light') {
    suggestions.push('Soft, natural colors work well');
  } else if (skinTone === 'tan' || skinTone === 'dark') {
    suggestions.push('Rich, warm tones complement your skin');
  }
  
  return suggestions;
};

module.exports = {
  analyzeBodyImage,
  analyzeFaceImage,
};

